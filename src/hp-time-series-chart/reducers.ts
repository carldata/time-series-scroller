/**
 * Declares default reducer function implementations
 * that can be reused by a concrete screen reducer
 */
import * as dateFns from 'date-fns';
import * as _ from 'lodash';
import { Action } from 'redux-actions';
import * as collections from 'typescript-collections';
import { Dictionary } from 'typescript-collections';

import { hpTimeSeriesChartCalculations as c } from './calculations';
import { ICsvDataLoadedContext } from './csv-loading/models';
import { IHpTimeSeriesChartState } from './state';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { IDateTimePoint } from './state/date-time-point';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from './state/enums';
import { ITimeSeries } from './state/time-series';

const SAMPLE_VALUE_MAX = 150;
const SECONDS_PER_SAMPLE = 60;

const buildInitialState = ():IHpTimeSeriesChartState => {
  let currentDate = new Date();
  let result: IHpTimeSeriesChartState = <IHpTimeSeriesChartState>{
    chartZoomSettings: <IChartZoomSettings>{
      zoomSelected: EnumZoomSelected.NoZoom
    },
    series: [],
    dateRangeDateFrom: currentDate,
    dateRangeDateTo: dateFns.addHours(currentDate, 6),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
    isDataLoading: false,
    windowDateFrom: currentDate,
    windowDateTo: dateFns.addHours(currentDate, 6),
    yMinValue: 0,
    yMaxValue: 0
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

/**
 * Builds (initial) chart state with several outer settings
 */
const generateRandomData = (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
  let [dateRangeDateFrom, dateRangeDateTo, windowDateFrom, windowDateTo] = action.payload;
  let points: Array<IDateTimePoint> = randomDateTimePoints(dateRangeDateFrom, dateRangeDateTo);
  return <IHpTimeSeriesChartState> {
    series: _.concat([], <ITimeSeries>{
      color: "steelblue",
      from: new Date(dateRangeDateFrom.getTime()),
      to: new Date(dateRangeDateTo.getTime()),
      name: "random series",
      points: points,
      rFactorSampleCache: c.createResampledPointsCache(points, 800),
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
    dateRangeDateFrom: new Date(windowDateFrom.getTime()),
    dateRangeDateTo: new Date(windowDateTo.getTime()),
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
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

const setWindowDateFromTo = (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
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

const setWindowWidthMinutes = (state: IHpTimeSeriesChartState, action: Action<number>): IHpTimeSeriesChartState => {
  return _.extend({}, state, {
    dateFromToMinimalWidthMinutes: action.payload
  });
}

const setChartPointsSelectionMode = (state: IHpTimeSeriesChartState, action: Action<EnumChartPointsSelectionMode>): IHpTimeSeriesChartState => {
  return _.extend({}, state, {
    graphPointsSelectionMode: action.payload
  });
}

const setZoom = (state: IHpTimeSeriesChartState, action: Action<[EnumZoomSelected, number]>): IHpTimeSeriesChartState => {
  let [zoom, widthPx] = action.payload;
  /**
   * Auxiliary function rebuilding rFactorSampleCache in all the series belonging to state
   */
  let rebuildSeriesSampleCache = (chartZoomSettings: IChartZoomSettings): ITimeSeries[] => {
    let result = [];
    _.each(state.series, el => {
      result.push(_.extend({}, el, <ITimeSeries>{
        rFactorSampleCache: c.rebuildSampleCacheAdjustedToCurrentZoomLevel(el.rFactorSampleCache, chartZoomSettings, widthPx)
      }));
    });
    return result;
  }

  let result = <IHpTimeSeriesChartState>{};
  let chartZoomSettings = <IChartZoomSettings> _.extend({}, state.chartZoomSettings, {
    zoomSelected: action.payload
  });
  switch (zoom) {
    case EnumZoomSelected.NoZoom:
      result = _.extend({}, state, {
        chartZoomSettings: chartZoomSettings,
        dateFromToMinimalWidthMinutes: dateFns.differenceInMinutes(state.windowDateTo, state.windowDateFrom)
      });
      break;
    case EnumZoomSelected.ZoomLevel1:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, zoom)) {
        chartZoomSettings = _.extend({}, chartZoomSettings, <IChartZoomSettings>{
          zoomLevel1FramePointsFrom: new Date(state.windowDateFrom.getTime()),
          zoomLevel1FramePointsTo: new Date(state.windowDateTo.getTime())
        });
        result = _.extend({}, state, <IHpTimeSeriesChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings)
        });
      } else {
        result = _.extend({}, state, <IHpTimeSeriesChartState>{
          chartZoomSettings: chartZoomSettings,
          series: rebuildSeriesSampleCache(chartZoomSettings),
          windowDateFrom: new Date(state.windowDateFrom.getTime()),
          windowDateTo: new Date(state.windowDateTo.getTime())
        });
      }
      break;
    case EnumZoomSelected.ZoomLevel2:
      if (cameToThisZoomLevelByZoomingIn(state.chartZoomSettings.zoomSelected, zoom)) {
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

export const hpTimeSeriesChartReducerAuxFunctions = {
  buildInitialState,
  setEvents
}

export const hpTimeSeriesChartReducers = {
  generateRandomData,
  setWindowDateFromTo,
  setWindowWidthMinutes,
  setChartPointsSelectionMode,
  setZoom,
}