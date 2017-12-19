import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries } from '../interfaces';
import { ITimeSeries } from '../state/time-series';
import { IDateTimePoint } from '../state/date-time-point';
import { IChartZoomSettings } from '../state/chart-zoom-settings';
import { EnumZoomSelected } from '../state/enums';
import { IHpTimeSeriesChartState } from '../state';
import { IGetTimeSeriesBucketsResult, ITimeSeriesBucket } from './interaces';

const debug = true;

enum EnumBrowseDirection {
  Backward,
  Forward
}

const constructBucket = (allData: IDateTimePoint[],
                         referenceBucket: ITimeSeriesBucket, 
                         delta: number, 
                         bucketLengthUnix: number,
                         boundaries: { firstSample: number, lastSample: number }): ITimeSeriesBucket => {
  let result =  <ITimeSeriesBucket> {
    unixFrom: referenceBucket.unixFrom + delta * bucketLengthUnix,
    unixTo: referenceBucket.unixFrom + (delta+1) * bucketLengthUnix,
  }
  let sampleValues = _.map(_.filter(allData, (el: IDateTimePoint) => el.unix >= result.unixFrom && el.unix <= result.unixTo), 
                           (el: IDateTimePoint) => el.value);
  result.min = _.min(sampleValues);
  result.max = _.min(sampleValues);
  result.date = new Date(result.unixFrom);
  return result;
}

const getNonemptyBucket = (allData: IDateTimePoint[], 
                           buckets: ITimeSeriesBucket[], 
                           browseDirection: EnumBrowseDirection, 
                           bucketLengthUnix: number): ITimeSeriesBucket => {
  let boundaries = {
    firstSample: _.first(allData).unix, 
    lastSample: _.last(allData).unix
  };
  let delta = (browseDirection == EnumBrowseDirection.Backward) ? -1 : 0;
  let referenceBucket = constructBucket(allData, 
                                        browseDirection == EnumBrowseDirection.Backward ? _.first(buckets) : _.last(buckets),
                                        delta,
                                        bucketLengthUnix,
                                        boundaries)
  
  while (referenceBucket.unixTo >= boundaries.firstSample && 
         referenceBucket.unixFrom <= boundaries.lastSample &&
         !_.isNumber(referenceBucket.min)) 
  {
    delta = delta + (EnumBrowseDirection.Backward ? -1 : +1);
    referenceBucket = constructBucket(allData, 
                                      browseDirection == EnumBrowseDirection.Backward ? _.first(buckets) : _.last(buckets),
                                      delta,
                                      bucketLengthUnix,
                                      boundaries);
  }
  return _.isNumber(referenceBucket.min) ? referenceBucket : null;
}

const getTimeSeriesBuckets = (allData: IDateTimePoint[], numberOfBuckets: number, filterFrom?: number, filterTo?: number): IGetTimeSeriesBucketsResult => {
  let data = allData;
  if (_.isNumber(filterFrom)) 
    data = _.filter(data, (el: IDateTimePoint) => el.unix >= filterFrom);
  else
    filterFrom = _.first(allData).unix;
  if (_.isNumber(filterTo)) 
    data = _.filter(data, (el: IDateTimePoint) => el.unix <= filterTo);
  else
    filterTo = _.last(allData).unix;
  if (data.length == 0)
    return {
      buckets: [],
      preceding: null,
      succeeding: null
    };
  if (data.length == 1)
    return {
      buckets: [<ITimeSeriesBucket>{
        unixFrom: _.first(data).unix,
        unixTo: _.first(data).unix,
        date: _.first(data).date,
        min: _.first(data).value,
        max: _.first(data).value,
      }],
      preceding: null,
      succeeding: null
    };
  const bucketLengthUnix = (_.last(data).unix - _.first(data).unix) / numberOfBuckets;
  const buckets =_.times<ITimeSeriesBucket>(numberOfBuckets, (n) => <ITimeSeriesBucket>{ 
    unixFrom: _.first(data).unix + n*bucketLengthUnix,
    unixTo: _.first(data).unix + (n+1)*bucketLengthUnix,
    date: new Date(_.first(data).unix + n*bucketLengthUnix),
    min: undefined,
    max: undefined
  });
  let bucketIndex = 0;
  let firstBucket = undefined;
  let referenceBucket = null;
  for (let el of data) {
    while (el.unix > buckets[bucketIndex].unixTo)
      bucketIndex++;
    referenceBucket = buckets[bucketIndex];
    if (_.isUndefined(firstBucket))
      firstBucket = referenceBucket;
    referenceBucket.min = (_.isUndefined(referenceBucket.min) || el.value < referenceBucket.min) ? el.value : referenceBucket.min; 
    referenceBucket.max = (_.isUndefined(referenceBucket.max) || el.value > referenceBucket.max) ? el.value : referenceBucket.max; 
    if (bucketIndex >= buckets.length)
      break;
  }
  const lastBucket = referenceBucket;
  let result = {
    buckets: buckets,
    preceding: firstBucket.unixFrom <= filterFrom ? 
      null :
      getNonemptyBucket(allData, buckets, EnumBrowseDirection.Backward, bucketLengthUnix),
    succeeding: lastBucket.unixTo >= filterTo ?
      null :
      getNonemptyBucket(allData, buckets, EnumBrowseDirection.Forward, bucketLengthUnix)
  };
  return result;
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
 * Converts ITimeSeries object to IChartTimeSeries object.
 * ITimeSeries is as model-adopted representation of time series.
 * ITimeSeriesChartBuckets is chart-adopted representation of time series, 
 * it has NOT such things like cache objects or the full timing of points.
 */
const getTimeSeriesChartBuckets = (series: ITimeSeries,
                                   from: Date, 
                                   to: Date, 
                                   numberOfBuckets: number): IChartTimeSeries => {  
  let unixFrom = from.getTime();
  let unixTo = to.getTime();
  let getTimeSeriesBucketsResult = getTimeSeriesBuckets(series.points, numberOfBuckets, unixFrom, unixTo);
  console.log(JSON.stringify(getTimeSeriesBucketsResult));
  let buckets = _.filter(getTimeSeriesBucketsResult.buckets, (b: ITimeSeriesBucket) => _.isNumber(b.min));
  return {
    name: series.name,
    color: series.color,
    buckets: buckets,
    precedingBucket: getTimeSeriesBucketsResult.preceding,
    succeedingBucket: getTimeSeriesBucketsResult.succeeding
  };
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

const translateUnixSecondsDomainToDateTime = (state: IHpTimeSeriesChartState, seconds: number): Date => {
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

export const hpTimeSeriesChartCalculations = {
  getTimeSeriesBuckets,
  getTimeSeriesChartBuckets,
  translateDateTimeToUnixSecondsDomain,
  translateUnixSecondsDomainToDateTime,
  calculateDomainLengthSeconds,
}