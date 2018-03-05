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
import { EnumZoomSelected } from './state/enums';
import { ITimeSeries } from './state/time-series';
import { hpTimeSeriesChartCalculations } from '../index';
import { unixIndexMapCalculations } from './calculations/unix-index-map';
import { IExternalSourceTimeSeries } from './interfaces';

const SAMPLE_VALUE_MAX = 150;
const SECONDS_PER_SAMPLE = 60;

const buildInitialState = ():IHpTimeSeriesChartState => {
  let currentDate = new Date();
  let result: IHpTimeSeriesChartState = <IHpTimeSeriesChartState>{
    chartZoomSettings: <IChartZoomSettings>{
      zoomSelected: EnumZoomSelected.NoZoom
    },
    series: [{
      name: "red",
      color: "red",
      points: [],
      unixToIndexMap: new Map(),
      unixFrom: currentDate.getTime(),
      unixTo: currentDate.getTime(),
    }],
    dateRangeUnixFrom: currentDate.getTime(),
    dateRangeUnixTo: dateFns.addHours(currentDate, 6).getTime(),
    isDataLoading: false,
    windowUnixFrom: currentDate.getTime(),
    windowUnixTo: dateFns.addHours(currentDate, 6).getTime(),
    yMin: 0,
    yMax: 0
  };
  return result;
}

const randomDateTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IUnixTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let currentValue = _.random(50, 100);
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: currentValue
    });
    referenceDate = dateFns.addSeconds(referenceDate, _.random(1, 5) * SECONDS_PER_SAMPLE);
    let chanceForChangeIndexValue = _.random(0, 100);
    if (_.inRange(chanceForChangeIndexValue, 0, 10)) {
      currentValue += 40 - _.random(0, 80);
    }
    if (_.inRange(chanceForChangeIndexValue, 10, 30)) {
      currentValue += 20 - _.random(0, 40);
    }
    iterationIndex++;
    if (iterationIndex % 50000 == 0) {
      console.log(`Generated for ${dateFns.format(referenceDate, "YYYY-MM-DD HH:mm")}`);
    }
  }
  return result;
};

const hourIsEvenDateTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IUnixTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IUnixTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: dateFns.getHours(referenceDate.getTime()) % 2 ? 1 : 0
    });
    referenceDate = dateFns.addSeconds(referenceDate, SECONDS_PER_SAMPLE);
    iterationIndex++;
    if (iterationIndex % 50000 == 0) {
      console.log(`Generated for ${dateFns.format(referenceDate, "YYYY-MM-DD HH:mm")}`);
    }
  }
  return result;
};


const cameToThisZoomLevelByZoomingIn = (currentMode: EnumZoomSelected, newMode: EnumZoomSelected) => {
  return newMode > currentMode;
}

const getFrameDatesByZoomLevel = (settings: IChartZoomSettings): Date[] => {
  switch (settings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      return [new Date(settings.zoomLevel1FramePointsUnixFrom), new Date(settings.zoomLevel1FramePointsUnixTo)];
    case EnumZoomSelected.ZoomLevel2:
      return [new Date(settings.zoomLevel2FramePointsUnixFrom), new Date(settings.zoomLevel2FramePointsUnixTo)];
  }
}

/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
  let [dateRangeDateFrom, dateRangeDateTo, windowDateFrom, windowDateTo] = action.payload;
  let pointsA: Array<IUnixTimePoint> = randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  let pointsB: Array<IUnixTimePoint> = [];//randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  return setData(state, {
    type: null,
    payload: [{
      color: "red",
      name: "Random Series A",
      points: pointsA
    }, {
      color: "green",
      name: "Random Series B",
      points: pointsB
    }]
  });
}

const setData = (state: IHpTimeSeriesChartState, action: Action<IExternalSourceTimeSeries[]>): IHpTimeSeriesChartState => {
  const stateWithSeries = <IHpTimeSeriesChartState> {
    series: _.map<IExternalSourceTimeSeries, ITimeSeries>(
      action.payload, 
      (el: IExternalSourceTimeSeries) => <ITimeSeries> {
        color: el.color,
        unixFrom: _.isEmpty(el.points) ? Number.MAX_VALUE : _.first(el.points).unix,
        unixTo: _.isEmpty(el.points) ? Number.MIN_VALUE : _.last(el.points).unix,
        points: el.points,
        name: el.name,
        unixToIndexMap: unixIndexMapCalculations.createUnixToIndexMap(el.points)
      })
  };
  const allValues: number[] = _.reduceRight<ITimeSeries, number[]>(stateWithSeries.series, 
    (accumulator: number[], series: ITimeSeries) =>
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

export const hpTimeSeriesChartReducerAuxFunctions = {
  buildInitialState,
  hourIsEvenDateTimePoints
}

export const hpTimeSeriesChartReducers = {
  generateRandomData,
  setZoom,
  setData
}