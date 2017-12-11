import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries, IZoomCacheElementDescription, IPluginFunctions } from './interfaces';
import { IDateTimePointSeriesCache } from './state/date-time-point-series-cache';
import { ITimeSeries } from './state/time-series';
import { IDateTimePoint } from './state/date-time-point';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { EnumZoomSelected } from './state/enums';
import { IHpTimeSeriesChartState } from './state';

const debug = false;

/**
 * This is the variable that holds default implementation of functions
 * that can be hot-replaced in a plugin-like mechanism.
 * In other words a developer can provide its own implementation of these functions. 
 */
const pluginFunctions = {
  getDataResampled: (data: IDateTimePoint[], rFactor: number): IDateTimePoint[]  => {
    let resampledSum = 0;
    let result: IDateTimePoint[] = [];
    let resampledTemporaryCache: number[] = [];
    let detectedEventInResampleFactorChunk: boolean = false;
    for (let i=0; i < data.length; i++) {
      resampledTemporaryCache.push(data[i].value);
      detectedEventInResampleFactorChunk = data[i].event || detectedEventInResampleFactorChunk;
      if (i % rFactor == 0) {
        result.push(<IDateTimePoint>{
          date: new Date(data[i].date.getTime()),
          unix: data[i].date.getTime(),
          value: _.sum(resampledTemporaryCache)/ rFactor,
          envelopeValueMin: _.min(resampledTemporaryCache),
          envelopeValueMax: _.max(resampledTemporaryCache),
          event: detectedEventInResampleFactorChunk
        });
        resampledTemporaryCache = [];
        detectedEventInResampleFactorChunk = false;
      }
    }
    return result;
  }
}

export const remapPluginFunctions = (functions: IPluginFunctions):void => {
  if (_.isFunction(functions.getDataResampled))
    pluginFunctions.getDataResampled = functions.getDataResampled;
}

/**
 * The theoretical distance between of two consecutive points in series provided as argument.
 * measured in pixels (in horizontal, x-scale). Note: this distance can be (and very often is)
 * in <0, 1> range.
 */
const getHorizontalSampleDistancePx = (series: any[], widthPx: number) => {
  return series.length > 1 ? (widthPx / (series.length-1)) : widthPx;
}

/**
 * How to resample raw data array in order to display data efficiently on screen.
 * 
 * The returned result describes how many samples from raw data array should be "skipped-out"/averaged in order to make sense to display them.
 * 
 * E.g. if canvas width size is 1024px and there are 1M samples, it definitely doesn't makes sense to display them all,
 * because more than a thousand samples from data will be represented by the same pixel on screen.
 * 
 * resampleFactor equal to N means that for given function parameters only every Nth sample from raw data array
 * should be taken to display on screen
 * 
 * rawDataSecondsPerSample holds declared density in the RAW data sample array
 */
const resampleFactor = (rawDataSecondsPerSample: number, widthPx: number, dateFrom: Date, dateTo: Date) => {
  let rawDataNumberOfSamplesInDateRange = dateFns.differenceInSeconds(dateTo, dateFrom) / rawDataSecondsPerSample;
  let samplesPerPixel = rawDataNumberOfSamplesInDateRange / widthPx;
  return samplesPerPixel < 1 ? 1 : _.ceil(samplesPerPixel);
}

const rFactorCacheDescription: Array<IZoomCacheElementDescription> = [
  { rFactorMin: 1, rFactorMax: 1, resampled: false },
  { rFactorMin: 2, rFactorMax: 3, resampled: true },
  { rFactorMin: 4, rFactorMax: 5, resampled: true },
  { rFactorMin: 6, rFactorMax: 8, resampled: true },
  { rFactorMin: 9, rFactorMax: 10, resampled: true },
  { rFactorMin: 11, rFactorMax: 25, resampled: true },
  { rFactorMin: 26, rFactorMax: 50, resampled: true },
  { rFactorMin: 51, rFactorMax: 200, resampled: true },
  { rFactorMin: 201, rFactorMax: 500, resampled: true },
  { rFactorMin: 501, rFactorMax: 1000, resampled: true },
  { rFactorMin: 1001, rFactorMax: 2000, resampled: true },
  { rFactorMin: 2001, rFactorMax: 5000, resampled: true }
];

const resampleFactorApproximation = (rFactor: number) => {
  let rFactorBelowLowestPossible = (rFactor < rFactorCacheDescription[0].rFactorMin);
  let rFactorAboveHighestPossible = !(_.isObject(_.find(rFactorCacheDescription, el => rFactor < el.rFactorMax)));
  if (rFactorBelowLowestPossible) {    
    debug ? console.log("There is no available approximation for rFactor", rFactor) : null;
    return rFactor;
  }
  if (rFactorAboveHighestPossible)
    return rFactorCacheDescription[rFactorCacheDescription.length-1].rFactorMax;
  return _.find(rFactorCacheDescription, el => rFactor >= el.rFactorMin && rFactor <= el.rFactorMax).rFactorMin;
}

/**
 * Must called after all samples were loaded from source and created 
 */
const createResampledPointsCache = (allSamples: IDateTimePoint[]): IDateTimePointSeriesCache[] => {
  var result = new Array<IDateTimePointSeriesCache>();
  debug ? console.log("building rFactor cache...") : null;
  _.each(rFactorCacheDescription, el => {
    debug ? console.log(`rFactor: ${el.rFactorMin}`) : null;
    let item = <IDateTimePointSeriesCache> {
      rFactor: el.rFactorMin,
      resampled: el.resampled,
      zoomedSamples: [], //leaving for now... until someone clicks on zoom level other than EnumZoomSelected.NoZoom
      noZoomSamples: el.resampled ? pluginFunctions.getDataResampled(allSamples, el.rFactorMin) : allSamples,
    }
    debug ? console.log(`rFactor: ${item.rFactor}, length: ${item.noZoomSamples.length}`) : null;
    result.push(item);
  });
  debug ? console.log("built rFactor cache !") : null;
  return result;
}

/**
 * Converts ITimeSeries object to IChartTimeSeries object.
 * ITimeSeries is as model-adopted representation of time series.
 * IChartTimeSeries is chart-adopted representation of time series, 
 * it has NOT such things like cache objects or the full timing of points.
 * That Selection is based on rFactor (resample factor), after a proper cache is chosen, samples are filtered by date from / to range.
 * Function important in regards to performance aspect.
 */
const getFilteredChartTimeSeries = (series: ITimeSeries, from: Date, to: Date, chartZoomSettings: IChartZoomSettings, canvasWidthPx: number): IChartTimeSeries => {  
  let result: IChartTimeSeries = {
    name: series.name,
    points: new Array<IDateTimePoint>(), //keep in mind array might represent resampled, not the exact samples read
    rFactor: 0,
    color: series.color,
    horizontalSampleDistancePx: 1
  };
  let unixFrom = from.getTime();
  let unixTo = to.getTime();
  let rFactorExact = resampleFactor(series.secondsPerSample, canvasWidthPx, new Date(from.getTime()), new Date(to.getTime()));
  result.rFactor = resampleFactorApproximation(rFactorExact);
  let rFactorCacheElement = _.find(series.rFactorSampleCache, el => el.rFactor == result.rFactor);
  if (series.applyResampling && _.isObject(rFactorCacheElement)) {
    switch (chartZoomSettings.zoomSelected) {
      case EnumZoomSelected.NoZoom:
        result.points = _.filter(rFactorCacheElement.noZoomSamples, el => el.unix >= unixFrom && el.unix <= unixTo);
        debug ? console.log('[Cache] rFactorExact', rFactorExact, 'rFactorApproximation', result.rFactor, 'source', rFactorCacheElement.noZoomSamples.length, 'result', result.points.length) : null;
        break;
      case EnumZoomSelected.ZoomLevel1:
      case EnumZoomSelected.ZoomLevel2:
        result.points = _.filter(rFactorCacheElement.zoomedSamples, el => el.unix >= unixFrom && el.unix <= unixTo);
        debug ? console.log('[Cache] rFactorExact', rFactorExact, 'rFactorApproximation', result.rFactor, 'source', rFactorCacheElement.zoomedSamples.length, 'result', result.points.length) : null;
        break;
    }
  } else {
    result.points = _.filter(series.points, el => el.unix >= unixFrom && el.unix <= unixTo);
    debug ? console.log('[NoCache] rFactorExact', rFactorExact, 'rFactorApproximation', result.rFactor, 'source', series.points.length, 'result', result.points.length) : null;
  }
  result.horizontalSampleDistancePx = getHorizontalSampleDistancePx(result.points, canvasWidthPx)
  return result;
}

const getUnixTimeStampLimitationsFromTo = (chartZoomSettings: IChartZoomSettings) => {
  let result = { unixFrom: 0, unixTo: 0 };
  switch (chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.ZoomLevel1:
      result.unixFrom = chartZoomSettings.zoomLevel1FramePointsFrom.getTime();
      result.unixTo = chartZoomSettings.zoomLevel1FramePointsTo.getTime();
      break;
    case EnumZoomSelected.ZoomLevel2:
      result.unixFrom = chartZoomSettings.zoomLevel2FramePointsFrom.getTime();
      result.unixTo = chartZoomSettings.zoomLevel2FramePointsTo.getTime();
      break;
  }
  return result;
}

/**
 * Calculates the difference - in minutes - between the datetime 
 * of the last point visible in window and the first point available in window
 */
const translateDateTimeToUnixMinutesDomain = (state: IHpTimeSeriesChartState, date: Date): number => {
  var result: number;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = dateFns.differenceInMinutes(date, state.dateRangeDateFrom);
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = dateFns.differenceInMinutes(date, state.chartZoomSettings.zoomLevel1FramePointsFrom);
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = dateFns.differenceInMinutes(date, state.chartZoomSettings.zoomLevel2FramePointsFrom);
      break;
  }
  return result;
}

const calculateDomainLengthMinutes = (state: IHpTimeSeriesChartState): number => {
  var result: number;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = translateDateTimeToUnixMinutesDomain(state, state.dateRangeDateTo);
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = translateDateTimeToUnixMinutesDomain(state, state.chartZoomSettings.zoomLevel1FramePointsTo);
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = translateDateTimeToUnixMinutesDomain(state, state.chartZoomSettings.zoomLevel2FramePointsTo);
      break;
  }
  return result;
}

const translateMinutesDomainToDateTime = (state: IHpTimeSeriesChartState, minutes: number): Date => {
  var result: Date;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = dateFns.addMinutes(state.dateRangeDateFrom, minutes)
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = dateFns.addMinutes(state.chartZoomSettings.zoomLevel1FramePointsFrom, minutes)
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = dateFns.addMinutes(state.chartZoomSettings.zoomLevel2FramePointsFrom, minutes)
      break;
  }
  return result;
}

const rebuildSampleCacheAdjustedToCurrentZoomLevel = (rFactorSampleCache: IDateTimePointSeriesCache[], chartZoomSettings: IChartZoomSettings):IDateTimePointSeriesCache[] => {
  var result = new Array<IDateTimePointSeriesCache>();  
  var limitations = getUnixTimeStampLimitationsFromTo(chartZoomSettings);
  _.each(rFactorSampleCache, el => {
    debug ? console.log(`building resample cache for ${el.rFactor}`, "el.noZoomSamples", el.noZoomSamples.length) : null;
    if (el.resampled) { //samples are already resampled, no need to resample them even more...
      el.zoomedSamples = _.filter(el.noZoomSamples, 
        (sample: IDateTimePoint) => (sample.unix >= limitations.unixFrom) && (sample.unix <= limitations.unixTo));
    }
    else {
      var filteredByDate = _.filter(el.noZoomSamples, 
        (sample: IDateTimePoint) => 
          (sample.unix >= limitations.unixFrom) && (sample.unix <= limitations.unixTo));
      el.zoomedSamples = pluginFunctions.getDataResampled(filteredByDate, el.rFactor);
    }
    result.push(el);
  });
  return result;
}

export const hpTimeSeriesChartCalculations = {
  createResampledPointsCache: createResampledPointsCache,
  getFilteredTimeSeries: getFilteredChartTimeSeries,
  translateDateTimeToMinutesDomain: translateDateTimeToUnixMinutesDomain,
  calculateDomainLengthMinutes: calculateDomainLengthMinutes,
  translateUnixMinutesDomainToDateTime: translateMinutesDomainToDateTime,
  rebuildSampleCacheAdjustedToCurrentZoomLevel: rebuildSampleCacheAdjustedToCurrentZoomLevel
}