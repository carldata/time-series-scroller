/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */

import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as collections from 'typescript-collections';
import { handleActions, Action } from 'redux-actions';
import { Dispatch } from 'redux';
import * as fetch from 'isomorphic-fetch';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from '../models/enums';
import { calculations as c } from './calculations';
import { IEventChartConfiguration } from './interfaces';
import { IChartZoomSettings } from '../models/chartZoomSettings';
import { ITimeSeries } from '../models/timeSeries';
import { IDateTimePoint } from '../models/dateTimePoint';
import { IChartState } from '../models/chartState';
import { csvDataLoadInitialize, csvDataLoadFinalize } from './csvLoading/reducers';

const SAMPLE_VALUE_MAX = 150;
const SECONDS_PER_SAMPLE = 5;

const buildInitialState = ():IChartState => {
  let result: IChartState = <IChartState>{
    chartZoomSettings: <IChartZoomSettings>{
      zoomSelected: EnumZoomSelected.NoZoom
    },
    series: [],
    dateRangeDateFrom: new Date(),
    dateRangeDateTo: new Date(),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
    isDataLoading: false,
    windowDateFrom: new Date(),
    windowDateTo: new Date(),
    yMinValue: 0,
    yMaxValue: 0
  };
  console.log('buildInitialState', result);
  return result;
}

const randomDateTimePoints = (dateRangeDateFrom: Date, dateRangeDateTo: Date): IDateTimePoint[] => {
  let referenceDate = new Date(dateRangeDateFrom.getTime());
  let result = [];
  let currentValue = _.random(50, 100);
  let iterationIndex = 0;
  while (dateFns.isBefore(referenceDate, dateRangeDateTo)) {
    result.push(<IDateTimePoint>{ 
      date: new Date(referenceDate.getTime()), 
      unix: referenceDate.getTime(), 
      value: currentValue, 
      envelopeValueMax: currentValue, 
      envelopeValueMin: currentValue 
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

/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (
  windowDateFrom: Date, 
  windowDateTo: Date,
  dateRangeDateFrom: Date,
  dateRangeDateTo: Date): IChartState => {
  let points: Array<IDateTimePoint> = randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  return <IChartState>{
    series: _.concat([], <ITimeSeries>{
      color: "steelblue",
      from: new Date(dateRangeDateFrom.getTime()),
      to: new Date(dateRangeDateTo.getTime()),
      name: "random series",
      points: points,
      rFactorSampleCache: c.createResampledPointsCache(points),
      secondsPerSample: SECONDS_PER_SAMPLE,
      yMinValue: _.min(_.map(points, el => el.value)),
      yMaxValue: _.max(_.map(points, el => el.value))
    }),
    chartZoomSettings: {
      zoomSelected: EnumZoomSelected.NoZoom,
      zoomLevel1FramePointsFrom: null,
      zoomLevel1FramePointsTo: null,
      zoomLevel2FramePointsFrom: null,
      zoomLevel2FramePointsTo: null
    },
    yMinValue: _.min(_.map(points, el => el.value)),
    yMaxValue: _.max(_.map(points, el => el.value)),
    windowDateFrom: new Date(windowDateFrom.getTime()),
    windowDateTo: new Date(windowDateTo.getTime()),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
  }
}


const cameToThisZoomLevelByZoomingIn = (currentMode: EnumZoomSelected, newMode: EnumZoomSelected) => {
  return newMode > currentMode;
}

const getFrameDatesByZoomLevel = (settings: IChartZoomSettings): Date[] => {
  switch (settings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      return [new Date(settings.zoomLevel1FramePointsFrom.getTime()), new Date(settings.zoomLevel1FramePointsTo.getTime())];
    case EnumZoomSelected.ZoomLevel2:
      return [new Date(settings.zoomLevel2FramePointsFrom.getTime()), new Date(settings.zoomLevel2FramePointsTo.getTime())];
  }
}

const setFrameDatesByZoomLevel = (settings: IChartZoomSettings, points: Date[]): IChartZoomSettings  => {
  let [pointFrom, pointTo] = points;
  switch (settings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      settings.zoomLevel1FramePointsFrom = new Date(pointFrom.getTime());
      settings.zoomLevel1FramePointsTo = new Date(pointTo.getTime());
      break; 
    case EnumZoomSelected.ZoomLevel2:
      settings.zoomLevel2FramePointsFrom = new Date(pointFrom.getTime());
      settings.zoomLevel2FramePointsTo = new Date(pointTo.getTime());
      break;
  }
  return settings;
}

const regenerateRandomData = (state: IChartState, action: Action<Date[]>): IChartState => {
  let [dateRangeDateFrom, dateRangeDateTo, windowDateFrom, windowDateTo] = action.payload;
  return generateRandomData(dateRangeDateFrom, dateRangeDateTo, windowDateFrom, windowDateTo);
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

const setWindowDateFromTo = (state: IChartState, action: Action<Date[]>): IChartState => {
  let [dateFrom, dateTo] = action.payload;
  if (dateFns.isBefore(dateFrom, state.dateRangeDateFrom)) {
    console.log(`rejecting - ${dateFrom} is before date range min value ${state.dateRangeDateFrom}`);
    return state;
  }
  if (dateFns.isAfter(dateTo, state.dateRangeDateTo)) {
    console.log(`rejecting - ${dateTo} is after date range max value ${state.dateRangeDateTo}`);
    return state;
  }
  return _.extend({}, state, {
    windowDateFrom: new Date(dateFrom.getTime()),
    windowDateTo: new Date(dateTo.getTime())
  });
}

const setWindowWidthMinutes = (state: IChartState, action: Action<number>): IChartState => {
  return _.extend({}, state, {
    dateFromToMinimalWidthMinutes: action.payload
  });
}

const setChartPointsSelectionMode = (state: IChartState, action: Action<EnumChartPointsSelectionMode>): IChartState => {
  return _.extend({}, state, {
    graphPointsSelectionMode: action.payload
  });
}

const setZoom = (state: IChartState, action: Action<EnumZoomSelected>): IChartState => {
  /**
   * Auxiliary function rebuilding rFactorSampleCache in all the series belonging to state
   */
  let rebuildSeriesSampleCache = (chartZoomSettings: IChartZoomSettings): ITimeSeries[] => {
    let result = [];
    _.each(state.series, el => {
      result.push(_.extend({}, el, <ITimeSeries>{
        rFactorSampleCache: c.rebuildSampleCacheAdjustedToCurrentZoomLevel(el.rFactorSampleCache, chartZoomSettings)
      }));
    });
    return result;
  }

  let result = <IChartState>{};
  let chartZoomSettings = <IChartZoomSettings> _.extend({}, state.chartZoomSettings, {
    zoomSelected: action.payload
  });
  switch (action.payload) {
    case EnumZoomSelected.NoZoom:
      result = _.extend({}, state, {
        chartZoomSettings: chartZoomSettings,
        dateFromToMinimalWidthMinutes: dateFns.differenceInMinutes(state.windowDateTo, state.windowDateFrom)
      });
      break;
    case EnumZoomSelected.ZoomLevel1:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, action.payload)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel1FramePointsFrom: new Date(state.windowDateFrom.getTime()),
          zoomLevel1FramePointsTo: new Date(state.windowDateTo.getTime())
        });
        result = _.extend({}, state, <IChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings)
        });
      } else {
        result = _.extend({}, state, <IChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings),
          windowDateFrom: new Date(state.windowDateFrom.getTime()),
          windowDateTo: new Date(state.windowDateTo.getTime())
        });
      }
      break;
    case EnumZoomSelected.ZoomLevel2:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, action.payload)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel2FramePointsFrom: new Date(state.windowDateFrom.getTime()),
          zoomLevel2FramePointsTo: new Date(state.windowDateTo.getTime())
        });
        result = _.extend({}, state, {
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings)
        });
      } else {
        //only 3 zoom levels - will not reach his else
      }
      break;
  }
  return result;
}

// Frame scroll not supported for now...

// const scrollToThePreviousFrame = (state: IChartState, action: Action<void>): IChartState => {
//   let chartZoomSettings = <IChartZoomSettings> _.extend({}, state.chartZoomSettings);
//   let [frameDateFrom, frameDateTo] = getFrameDatesByZoomLevel(state.chartZoomSettings);
//   let frameLengthSeconds = dateFns.differenceInSeconds(frameDateTo, frameDateFrom);
//   let windowLengthSeconds = dateFns.differenceInSeconds(state.windowDateTo.toDate(), state.windowDateFrom.toDate());
//   let suggestedFrameDateFrom = dateFns.subSeconds(frameDateFrom, frameLengthSeconds);
//   frameDateFrom = dateFns.isBefore(suggestedFrameDateFrom, state.dateRangeDateFrom.toDate()) ? state.dateRangeDateFrom.toDate() : suggestedFrameDateFrom;
//   frameDateTo = dateFns.addSeconds(frameDateFrom, frameLengthSeconds);
//   chartZoomSettings = setFrameDatesByZoomLevel(chartZoomSettings, [frameDateFrom, frameDateTo]);
//   let result = _.extend({}, state, <IChartState> {
//     windowDateFrom: moment(dateFns.subSeconds(frameDateTo, windowLengthSeconds)),
//     windowDateTo: moment(frameDateTo),
//     rFactorSampleCache: c.rebuildSampleCacheAdjustedToCurrentZoomLevel(state.rFactorSampleCache, chartZoomSettings),
//     chartZoomSettings: chartZoomSettings
//   });
//   return result;
// }

// const scrollToTheNextFrame = (state: IChartState, action: Action<void>): IChartState => {
//   let chartZoomSettings = <IChartZoomSettings> _.extend({}, state.chartZoomSettings);
//   let [frameDateFrom, frameDateTo] = getFrameDatesByZoomLevel(state.chartZoomSettings);
//   let frameLengthSeconds = dateFns.differenceInSeconds(frameDateTo, frameDateFrom);
//   let windowLengthSeconds = dateFns.differenceInSeconds(state.windowDateTo.toDate(), state.windowDateFrom.toDate());
//   let suggestedFrameDateTo = dateFns.addSeconds(frameDateTo, frameLengthSeconds);
//   frameDateTo = dateFns.isAfter(suggestedFrameDateTo, state.dateRangeDateTo.toDate()) ? state.dateRangeDateTo.toDate() : suggestedFrameDateTo;
//   frameDateFrom = dateFns.subSeconds(frameDateTo, frameLengthSeconds);
//   chartZoomSettings = setFrameDatesByZoomLevel(chartZoomSettings, [frameDateFrom, frameDateTo]);
//   let result = _.extend({}, state, <IChartState> {
//     windowDateFrom: moment(frameDateFrom),
//     windowDateTo: moment(dateFns.addSeconds(frameDateFrom, windowLengthSeconds)),
//     rFactorSampleCache: c.rebuildSampleCacheAdjustedToCurrentZoomLevel(state.rFactorSampleCache, chartZoomSettings),
//     chartZoomSettings: chartZoomSettings
//   });
//   return result;
// }

export const reducers = {
  buildInitialState,
  csvDataLoadInitialize,
  csvDataLoadFinalize,
  setEvents,
  regenerateRandomData,
  setWindowDateFromTo,
  setWindowWidthMinutes,
  setChartPointsSelectionMode,
  setZoom,
  // Frame scroll not supported for now...
  // scrollToThePreviousFrame,
  // scrollToTheNextFrame
}