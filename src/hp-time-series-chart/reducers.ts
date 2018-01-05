/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { Action } from 'redux-actions';
import * as collections from 'typescript-collections';
import { Dictionary } from 'typescript-collections';

import { hpTimeSeriesChartCalculations as c } from './calculations';
import { ICsvDataLoadedContext } from './csv-loading/models';
import { IHpTimeSeriesChartState } from './state';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { IDateTimePoint } from './state/date-time-point';
import { EnumZoomSelected } from './state/enums';
import { ITimeSeries } from './state/time-series';
import { hpTimeSeriesChartCalculations } from '../index';

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

const randomDateTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IDateTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let currentValue = _.random(50, 100);
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IDateTimePoint>{ 
      unix: referenceDate.getTime(), 
      value: currentValue
    });
    referenceDate = dateFns.addSeconds(referenceDate, SECONDS_PER_SAMPLE);
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

const hourIsEvenDateTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IDateTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IDateTimePoint>{ 
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
  let points: Array<IDateTimePoint> = randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  return <IHpTimeSeriesChartState> {
    series: [<ITimeSeries>{
      color: "steelblue",
      unixFrom: dateRangeDateFrom.getTime(),
      unixTo: dateRangeDateTo.getTime(),
      name: "random series",
      points: points,
      unixToIndexMap: hpTimeSeriesChartCalculations.createUnixToIndexMap(points)
    }],
    chartZoomSettings: {
      zoomSelected: EnumZoomSelected.NoZoom,
      zoomLevel1FramePointsUnixFrom: 0,
      zoomLevel1FramePointsUnixTo: 0,
      zoomLevel2FramePointsUnixFrom: 0,
      zoomLevel2FramePointsUnixTo: 0
    },
    yMin: _.min(_.map(points, el => el.value)),
    yMax: _.max(_.map(points, el => el.value)),
    windowUnixFrom: windowDateFrom.getTime(),
    windowUnixTo: windowDateTo.getTime(),
    dateRangeUnixFrom: windowDateFrom.getTime(),
    dateRangeUnixTo: windowDateTo.getTime()
  }
}

const setEvents = (series: ITimeSeries, action: Action<collections.Dictionary<number, boolean>>): ITimeSeries => {  
  let unixDatesContainingEvents = action.payload;
  let points: IDateTimePoint[] = [];
  _.each(series.points, el => {
    let point = _.extend(el, <IDateTimePoint>{
      event: action.payload.containsKey(el.unix)
    });
    points.push(point);
  });
  return _.extend({}, series, <ITimeSeries> {
    points: points
  });
}

const setZoom = (state: IHpTimeSeriesChartState, action: Action<[EnumZoomSelected, number]>): IHpTimeSeriesChartState => {
  let [zoom, widthPx] = action.payload;
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
  setEvents,
  hourIsEvenDateTimePoints
}

export const hpTimeSeriesChartReducers = {
  generateRandomData,
  setZoom,
}