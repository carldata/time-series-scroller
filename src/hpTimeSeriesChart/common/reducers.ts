/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */

import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as collections from 'typescript-collections';
import { handleActions, Action } from 'redux-actions';
import { Promise } from 'es6-promise';
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
    dateRangeDateFrom: moment(),
    dateRangeDateTo: moment(),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
    isDataLoading: false,
    windowDateFrom: moment(),
    windowDateTo: moment(),
    yMinValue: 0,
    yMaxValue: 0
  };
  console.log('buildInitialState', result);
  return result;
}

const randomDateTimePoints = (dateRangeDateFrom: moment.Moment, dateRangeDateTo: moment.Moment): IDateTimePoint[] => {
  let referenceDate = dateRangeDateFrom.clone();  
  let result = [];
  let currentValue = _.random(50, 100);
  let iterationIndex = 0;
  while (referenceDate.isBefore(dateRangeDateTo)) {
    result.push(<IDateTimePoint>{ 
      date: referenceDate.clone(), 
      unix: referenceDate.unix(), 
      value: currentValue, 
      envelopeValueMax: currentValue, 
      envelopeValueMin: currentValue 
    });
    referenceDate.add(SECONDS_PER_SAMPLE, "second");
    let chanceForChangeIndexValue = _.random(0, 100);
    if (_.inRange(chanceForChangeIndexValue, 0, 10)) {
      currentValue += 40 - _.random(0, 80);
    }
    if (_.inRange(chanceForChangeIndexValue, 10, 30)) {
      currentValue += 20 - _.random(0, 40);
    }
    iterationIndex++;
    if (iterationIndex % 50000 == 0) {
      console.log(`Generated for ${referenceDate.format("YYYY-MM-DD HH:mm")}`);
    }
  }
  return result;
};

/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (windowDateFrom: moment.Moment, 
  windowDateTo: moment.Moment,
  dateRangeDateFrom: moment.Moment,
  dateRangeDateTo: moment.Moment): IChartState => {
  let points: Array<IDateTimePoint> = randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  return <IChartState>{
    series: _.concat([], <ITimeSeries>{
      color: "steelblue",
      from: dateRangeDateFrom.clone(),
      to: dateRangeDateTo.clone(),
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
    windowDateFrom: windowDateFrom.clone(),
    windowDateTo: windowDateTo.clone(),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
  }
}


const cameToThisZoomLevelByZoomingIn = (currentMode: EnumZoomSelected, newMode: EnumZoomSelected) => {
  return newMode > currentMode;
}

const getFrameDatesByZoomLevel = (settings: IChartZoomSettings): Date[] => {
  switch (settings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      return [settings.zoomLevel1FramePointsFrom.toDate(), settings.zoomLevel1FramePointsTo.toDate()];
    case EnumZoomSelected.ZoomLevel2:
      return [settings.zoomLevel2FramePointsFrom.toDate(), settings.zoomLevel2FramePointsTo.toDate()];
  }
}

const setFrameDatesByZoomLevel = (settings: IChartZoomSettings, points: Date[]): IChartZoomSettings  => {
  let [pointFrom, pointTo] = points;
  switch (settings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      settings.zoomLevel1FramePointsFrom = moment(pointFrom);
      settings.zoomLevel1FramePointsTo = moment(pointTo);
      break; 
    case EnumZoomSelected.ZoomLevel2:
      settings.zoomLevel2FramePointsFrom = moment(pointFrom);
      settings.zoomLevel2FramePointsTo = moment(pointTo);
      break;
  }
  return settings;
}

const regenerateRandomData = (state: IChartState, action: Action<moment.Moment[]>): IChartState => {
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

const setWindowDateFromTo = (state: IChartState, action: Action<moment.Moment[]>): IChartState => {
  let [dateFrom, dateTo] = action.payload;
  if (dateFrom.isBefore(state.dateRangeDateFrom)) {
    console.log(`rejecting - ${dateFrom.toDate()} is before date range min value ${state.dateRangeDateFrom.toDate()}`);
    return state;
  }
  if (dateTo.isAfter(state.dateRangeDateTo)) {
    console.log(`rejecting - ${dateTo.toDate()} is after date range max value ${state.dateRangeDateTo.toDate()}`);
    return state;
  }
  return _.extend({}, state, {
    windowDateFrom: dateFrom.clone(),
    windowDateTo: dateTo.clone()
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
        dateFromToMinimalWidthMinutes: state.windowDateTo.clone().diff(state.windowDateFrom, "minute")
      });
      break;
    case EnumZoomSelected.ZoomLevel1:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, action.payload)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel1FramePointsFrom: state.windowDateFrom.clone(),
          zoomLevel1FramePointsTo: state.windowDateTo.clone()
        });
        result = _.extend({}, state, <IChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings)
        });
      } else {
        result = _.extend({}, state, <IChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings),
          windowDateFrom: state.windowDateFrom.clone(),
          windowDateTo: state.windowDateTo.clone()
        });
      }
      break;
    case EnumZoomSelected.ZoomLevel2:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, action.payload)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel2FramePointsFrom: state.windowDateFrom.clone(),
          zoomLevel2FramePointsTo: state.windowDateTo.clone()
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