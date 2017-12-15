import { ITimeSeriesBucket } from './time-series-bucket';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries, IZoomCacheElementDescription, IPluginFunctions } from '../interfaces';
import { IDateTimePointSeriesCache } from '../state/date-time-point-series-cache';
import { ITimeSeries } from '../state/time-series';
import { IDateTimePoint } from '../state/date-time-point';
import { IChartZoomSettings } from '../state/chart-zoom-settings';
import { EnumZoomSelected } from '../state/enums';
import { IHpTimeSeriesChartState } from '../state';

const debug = true;

const getTimeSeriesBuckets = (data: IDateTimePoint[], numberOfBuckets: number): ITimeSeriesBucket[] => {
  if (data.length == 0)
    return [];
  if (data.length == 1)
    return [<ITimeSeriesBucket>{
      unixFrom: _.first(data).unix,
      unixTo: _.first(data).unix,
      samples: [_.first(data)]
    }];
  let bucketLengthUnix = (_.last(data).unix - _.first(data).unix) / numberOfBuckets;
  let buckets: ITimeSeriesBucket[] = [];
  for (let i=0; i < numberOfBuckets; i++) {
    buckets.push(<ITimeSeriesBucket> {
      unixFrom: _.first(data).unix + i * bucketLengthUnix,
      unixTo: _.first(data).unix + (i+1)*bucketLengthUnix,
      samples: []
    });
  }
  for (let el of data) {
    let bucketsMatch = _.filter(buckets, b => el.unix >= b.unixFrom && el.unix <= b.unixTo);
    _.each(bucketsMatch, b => b.samples.push(el));
  }
  return buckets;
}

/**
 * This is the variable that holds default implementation of functions
 * that can be hot-replaced in a plugin-like mechanism.
 * In other words a developer can provide its own implementation of these functions. 
 */
const pluginFunctions = {
  getDataResampled: (data: IDateTimePoint[], numberOfBuckets: number): IDateTimePoint[]  => {
    let result: IDateTimePoint[] = [];
    let buckets = getTimeSeriesBuckets(data, numberOfBuckets);
    for (const bucket of buckets) {
      if (bucket.samples.length > 0) {
        result.push(<IDateTimePoint>{
          date: new Date(bucket.unixFrom),
          unix: bucket.unixFrom,
          value: _.sum(_.map(bucket.samples, s => s.value)) / bucket.samples.length,
          envelopeValueMin: _.min(_.map(bucket.samples, s => s.value)),
          envelopeValueMax: _.max(_.map(bucket.samples, s => s.value)),
          event: false
        })
      }
    }
    console.log(buckets);
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
const createResampledPointsCache = (allSamples: IDateTimePoint[], widthPx: number): IDateTimePointSeriesCache[] => {
  var result = new Array<IDateTimePointSeriesCache>();
  debug ? console.log("building rFactor cache...") : null;
  _.each(rFactorCacheDescription, el => {
    debug ? console.log(`rFactor: ${el.rFactorMin}`) : null;
    let item = <IDateTimePointSeriesCache> {
      rFactor: el.rFactorMin,
      resampled: el.resampled,
      zoomedSamples: [], //leaving for now... until someone clicks on zoom level other than EnumZoomSelected.NoZoom
      noZoomSamples: el.resampled ? pluginFunctions.getDataResampled(allSamples, widthPx) : allSamples,
    }
    debug ? console.log(`rFactor: ${item.rFactor}, length: ${item.noZoomSamples.length}`) : null;
    result.push(item);
  });
  debug ? console.log("built rFactor cache !") : null;
  return result;
}

/**
 * Custom filter function that adds additional preceding and succeeding samples 
 * (necessary for time series that are not distributed uniformly)
 */
const filter = (series: IDateTimePoint[], unixFrom: number, unixTo: number): IDateTimePoint[] => {
  if (series.length <= 1)
    return series;
  let result = _.filter(series, el => el.unix >= unixFrom && el.unix <= unixTo);
  let preceding = _.last(_.filter(series, el => el.unix < unixFrom));
  let succeeding = _.first(_.filter(series, el => el.unix > unixTo));
  return _.concat(
    _.isObject(preceding) ? [preceding] : [], 
    result, 
    _.isObject(succeeding) ? [succeeding] : []);
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
        result.points = filter(rFactorCacheElement.noZoomSamples, unixFrom, unixTo);
        debug ? console.log('[Cache] rFactorExact', rFactorExact, 'rFactorApproximation', result.rFactor, 'source', rFactorCacheElement.noZoomSamples.length, 'result', result.points.length) : null;
        break;
      case EnumZoomSelected.ZoomLevel1:
      case EnumZoomSelected.ZoomLevel2:
        result.points = filter(rFactorCacheElement.zoomedSamples, unixFrom, unixTo);
        debug ? console.log('[Cache] rFactorExact', rFactorExact, 'rFactorApproximation', result.rFactor, 'source', rFactorCacheElement.zoomedSamples.length, 'result', result.points.length) : null;
        break;
    }
  } else {
    result.points = filter(series.points, unixFrom, unixTo);
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
const translateDateTimeToUnixSecondsDomain = (state: IHpTimeSeriesChartState, date: Date): number => {
  var result: number;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = dateFns.differenceInSeconds(date, state.dateRangeDateFrom);
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = dateFns.differenceInSeconds(date, state.chartZoomSettings.zoomLevel1FramePointsFrom);
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = dateFns.differenceInSeconds(date, state.chartZoomSettings.zoomLevel2FramePointsFrom);
      break;
  }
  return result;
}

const calculateDomainLengthSeconds = (state: IHpTimeSeriesChartState): number => {
  var result: number;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = translateDateTimeToUnixSecondsDomain(state, state.dateRangeDateTo);
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = translateDateTimeToUnixSecondsDomain(state, state.chartZoomSettings.zoomLevel1FramePointsTo);
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = translateDateTimeToUnixSecondsDomain(state, state.chartZoomSettings.zoomLevel2FramePointsTo);
      break;
  }
  return result;
}

const translateSecondsDomainToDateTime = (state: IHpTimeSeriesChartState, seconds: number): Date => {
  var result: Date;
  switch (state.chartZoomSettings.zoomSelected) {
    case EnumZoomSelected.NoZoom:
      result = dateFns.addSeconds(state.dateRangeDateFrom, seconds)
      break;
    case EnumZoomSelected.ZoomLevel1:
      result = dateFns.addSeconds(state.chartZoomSettings.zoomLevel1FramePointsFrom, seconds)
      break;
    case EnumZoomSelected.ZoomLevel2:
      result = dateFns.addSeconds(state.chartZoomSettings.zoomLevel2FramePointsFrom, seconds)
      break;
  }
  return result;
}

const rebuildSampleCacheAdjustedToCurrentZoomLevel = (rFactorSampleCache: IDateTimePointSeriesCache[], chartZoomSettings: IChartZoomSettings, widthPx: number):IDateTimePointSeriesCache[] => {
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
  getTimeSeriesBuckets: getTimeSeriesBuckets,
  createResampledPointsCache: createResampledPointsCache,
  getFilteredTimeSeries: getFilteredChartTimeSeries,
  translateDateTimeToSecondsDomain: translateDateTimeToUnixSecondsDomain,
  calculateDomainLengthSeconds: calculateDomainLengthSeconds,
  translateUnixSecondsDomainToDateTime: translateSecondsDomainToDateTime,
  rebuildSampleCacheAdjustedToCurrentZoomLevel: rebuildSampleCacheAdjustedToCurrentZoomLevel
}