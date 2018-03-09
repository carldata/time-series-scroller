/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { Action } from 'redux-actions';

import { hpTimeSeriesChartCalculations as c } from './calculations';
import { IHpTimeSeriesChartState } from './state';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { IUnixTimePoint } from './state/unix-time-point';
import { EnumZoomSelected, EnumTimeSeriesType } from './state/enums';
import { unixIndexMapCalculations } from './calculations/unix-index-map';
import { hpTimeSeriesChartReducerAuxFunctions as auxFunctions } from './reducers-aux';
import { IExternalSourceTimeSeries, IHpTimeSeriesChartTimeSeries } from './state/time-series';


/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
  let [dateRangeDateFrom, dateRangeDateTo, windowDateFrom, windowDateTo] = action.payload;
  let pointsA: Array<IUnixTimePoint> = auxFunctions.randomContinousUnixTimePoints(dateRangeDateFrom, dateRangeDateTo);
  let pointsB: Array<IUnixTimePoint> = auxFunctions.randomIntermittentUnixTimePoints(
    dateFns.addHours(dateRangeDateFrom, dateFns.differenceInHours(dateRangeDateTo, dateRangeDateFrom)/3), 
    dateFns.addHours(dateRangeDateTo, -dateFns.differenceInHours(dateRangeDateTo, dateRangeDateFrom)/3));
  let pointsC: Array<IUnixTimePoint> = auxFunctions.randomIntermittentUnixTimePoints(
    dateFns.addHours(dateRangeDateFrom, dateFns.differenceInHours(dateRangeDateTo, dateRangeDateFrom)/5), 
    dateFns.addHours(dateRangeDateTo, -dateFns.differenceInHours(dateRangeDateTo, dateRangeDateFrom)/5));
  return setData(state, {
    type: null,
    payload: [{
      color: "orange",
      name: "Random Series",
      points: pointsA,
      type: EnumTimeSeriesType.Line,
    }, {
      color: "green",
      name: "Random Series",
      points: pointsB,
      type: EnumTimeSeriesType.Dots
    },
    {
      color: "red",
      name: "Random Series",
      points: pointsC,
      type: EnumTimeSeriesType.DottedLine
    }]
  });
}

const setData = (state: IHpTimeSeriesChartState, action: Action<IExternalSourceTimeSeries[]>): IHpTimeSeriesChartState => {
  const stateWithSeries = <IHpTimeSeriesChartState> {
    series: _.map<IExternalSourceTimeSeries, IHpTimeSeriesChartTimeSeries>(
      action.payload, 
      (el: IExternalSourceTimeSeries) => <IHpTimeSeriesChartTimeSeries> {
        color: el.color,
        unixFrom: _.isEmpty(el.points) ? Number.MAX_VALUE : _.first(el.points).unix,
        unixTo: _.isEmpty(el.points) ? Number.MIN_VALUE : _.last(el.points).unix,
        points: el.points,
        name: el.name,
        type: el.type,
        unixToIndexMap: unixIndexMapCalculations.createUnixToIndexMap(el.points)
      })
  };
  const allValues: number[] = _.reduceRight<IHpTimeSeriesChartTimeSeries, number[]>(stateWithSeries.series, 
    (accumulator: number[], series: IHpTimeSeriesChartTimeSeries) =>
      _.concat(accumulator, _.map(series.points, el => el.value)), []);
  const unixFrom = _.min(_.concat(_.map(stateWithSeries.series, el => el.unixFrom)));
  const unixTo = _.max(_.concat(_.map(stateWithSeries.series, el => el.unixTo)));
  const stateWithUnixFromTo = _.extend(stateWithSeries, <IHpTimeSeriesChartState>{
    dateRangeUnixFrom: unixFrom,
    dateRangeUnixTo: unixTo,
    windowUnixFrom: unixFrom,
    windowUnixTo: unixTo,
    yMin: _.min(allValues),
    yMax: _.max(allValues)
  });
  const stateWithChartSettings = <IHpTimeSeriesChartState> {
    chartZoomSettings: {
      zoomSelected: EnumZoomSelected.NoZoom,
      zoomLevel1FramePointsUnixFrom: 0,
      zoomLevel1FramePointsUnixTo: 0,
      zoomLevel2FramePointsUnixFrom: 0,
      zoomLevel2FramePointsUnixTo: 0
    }
  }
  return _.extend(stateWithSeries, stateWithUnixFromTo, stateWithChartSettings);
}

const cameToThisZoomLevelByZoomingIn = (currentMode: EnumZoomSelected, newMode: EnumZoomSelected) => {
  return newMode > currentMode;
}

const setZoom = (state: IHpTimeSeriesChartState, action: Action<EnumZoomSelected>): IHpTimeSeriesChartState => {
  let zoom = action.payload;
  let result = <IHpTimeSeriesChartState>{};
  let chartZoomSettings = <IChartZoomSettings> _.extend({}, state.chartZoomSettings, {
    zoomSelected: action.payload
  });
  switch (zoom) {
    case EnumZoomSelected.NoZoom:
      result = _.extend({}, state, {
        chartZoomSettings: chartZoomSettings
      });
      break;
    case EnumZoomSelected.ZoomLevel1:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, zoom)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel1FramePointsUnixFrom: state.windowUnixFrom,
          zoomLevel1FramePointsUnixTo: state.windowUnixTo
        });
        result = _.extend({}, state, <IHpTimeSeriesChartState>{
          chartZoomSettings: chartZoomSettings
        });
      } else {
        result = _.extend({}, state, <IHpTimeSeriesChartState>{
          chartZoomSettings: chartZoomSettings,
          windowUnixFrom: state.windowUnixFrom,
          windowUnixTo: state.windowUnixTo
        });
      }
      break;
    case EnumZoomSelected.ZoomLevel2:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, zoom)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel2FramePointsUnixFrom: state.windowUnixFrom,
          zoomLevel2FramePointsUnixTo: state.windowUnixTo
        });
        result = _.extend({}, state, {
          chartZoomSettings: chartZoomSettings
        });
      } else {
        //only 3 zoom levels - will not reach his else
      }
      break;
  }
  return result;
}

export const hpTimeSeriesChartReducers = {
  generateRandomData,
  setZoom,
  setData
}