import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries } from '../interfaces';
import { ITimeSeries } from '../state/time-series';
import { IDateTimePoint } from '../state/date-time-point';
import { IChartZoomSettings } from '../state/chart-zoom-settings';
import { EnumZoomSelected } from '../state/enums';
import { IHpTimeSeriesChartState } from '../state';
import { IChartTimeSeriesBuckets, ITimeSeriesBucket } from './interfaces';
import { csvLoadingCalculations } from '../csv-loading/calculations';
import { UNIX_TO_INDEX_MAP_PRECISION } from '../state/settings';

const debug = true;

enum EnumBrowseDirection {
  Backward,
  Forward
}

const getBucketOutside = (allData: IDateTimePoint[],
                          browseDirection: EnumBrowseDirection,
                          filterFrom: number,
                          filterTo: number): ITimeSeriesBucket => 
{
  let sample = browseDirection == EnumBrowseDirection.Backward ?
    _.last(_.filter(allData, (el: IDateTimePoint) => el.unix <= filterFrom)) :
    _.first(_.filter(allData, (el: IDateTimePoint) => el.unix >= filterTo));
  return _.isObject(sample) ?
    <ITimeSeriesBucket>{
      date: sample.date,
      minY: sample.value,
      maxY: sample.value,
      leftboundY: sample.value,
      rightboundY: sample.value,
      unixFrom: browseDirection == EnumBrowseDirection.Backward ? filterFrom : filterTo,
      unixTo: browseDirection == EnumBrowseDirection.Backward ? filterFrom : filterTo
    } : null;
}

const getBucketForTime = (unix: number,
                          filterFrom: number,
                          bucketLengthUnix: number): ITimeSeriesBucket => 
{
  let bucketIndex = _.floor((unix - filterFrom) / bucketLengthUnix);
  return <ITimeSeriesBucket> {
    unixFrom: filterFrom + bucketIndex * bucketLengthUnix,
    unixTo: filterFrom + (bucketIndex+1) * bucketLengthUnix
  }
}

const getTimeSeriesBuckets = (allData: IDateTimePoint[],
                              unixToIndexMap: Map<number, number>,
                              numberOfBuckets: number,
                              filterFrom?: number,
                              filterTo?: number): IChartTimeSeriesBuckets => 
{
  if (allData.length == 0)
    return <IChartTimeSeriesBuckets> { 
      buckets: [], 
      shadowPreceding: null, 
      shadowSucceeding: null 
    };
  filterFrom = _.isNumber(filterFrom) ? filterFrom : _.first(allData).unix;
  filterTo = _.isNumber(filterTo) ? filterTo : _.last(allData).unix;
  let bucketLengthUnix = (filterTo - filterFrom) / numberOfBuckets;
  let indexFrom = findIndexToBrowsePointsFrom(allData, unixToIndexMap, filterFrom);
  let buckets: ITimeSeriesBucket[] = [];
  let referenceBucket: ITimeSeriesBucket = null;
  for (let i = indexFrom; i < allData.length; i++) {
    let el = allData[i];
    if (el.unix > filterTo)
      break;
    if ((referenceBucket == null) || (referenceBucket.unixTo < el.unix)) {
      let bucketIndex = _.floor((el.unix - filterFrom) / bucketLengthUnix);
      referenceBucket = <ITimeSeriesBucket>{
        unixFrom: filterFrom + bucketIndex * bucketLengthUnix,
        unixTo: filterFrom + (bucketIndex + 1) * bucketLengthUnix,
        date: new Date(filterFrom + (bucketIndex + 0.5) * bucketLengthUnix),
        leftboundY: el.value,
        numberOfSamples: 0,
        minY: el.value,
        maxY: el.value
      }
      buckets.push(referenceBucket);
    }
    referenceBucket.rightboundY = el.value;
    referenceBucket.numberOfSamples++;
    referenceBucket.minY = el.value < referenceBucket.minY ? el.value : referenceBucket.minY;
    referenceBucket.maxY = el.value > referenceBucket.maxY ? el.value : referenceBucket.maxY;
  }
  return {
    buckets: buckets,
    shadowPreceding: buckets.length > 0 && _.first(buckets).unixFrom <= filterFrom ? null : getBucketOutside(allData, EnumBrowseDirection.Backward, filterFrom, filterTo),
    shadowSucceeding: buckets.length > 0 && _.last(buckets).unixTo >= filterTo ? null : getBucketOutside(allData, EnumBrowseDirection.Forward, filterFrom, filterTo)
  };
}

const findIndexToBrowsePointsFrom = (allData: IDateTimePoint[],
                                    unixToIndexMap: Map<number, number>,
                                    filterFrom: number): number => {
  let result = 0;
  let optimizationMapBucketLengthUnix = (_.last(allData).unix - _.first(allData).unix) / UNIX_TO_INDEX_MAP_PRECISION;
  let bucket = hpTimeSeriesChartCalculations.getBucketForTime(filterFrom,
                                                              _.first(allData).unix,
                                                              optimizationMapBucketLengthUnix);
  return unixToIndexMap.get(bucket.unixFrom);
}

/**
 * Converts ITimeSeries object to IChartTimeSeries object.
 * ITimeSeries is as model-adopted representation of time series.
 * ITimeSeriesChartBuckets is chart-adopted representation of time series, 
 * it has NOT such things like cache objects or the full timing of points.
 */
const getTimeSeriesChartBuckets = (series: ITimeSeries,
                                   unixFrom: number,
                                   unixTo: number,
                                   numberOfBuckets: number): IChartTimeSeries => {
  let buckets = getTimeSeriesBuckets(series.points, series.unixToIndexMap, numberOfBuckets, unixFrom, unixTo);
  return {
    name: series.name,
    color: series.color,
    buckets: buckets
  };
}

const findFirstIndexMeetingUnixFrom = (allPoints: IDateTimePoint[], unixFrom: number, lastIndex: number): number => {
  for (let i=lastIndex; i < allPoints.length-1; i++) {
    if (allPoints[i].unix >= unixFrom)
      return i;
  }
  return 0;
}

const createUnixToIndexMap = (allPoints: IDateTimePoint[]): Map<number, number> => {
  let result: Map<number, number> = new Map();
  if (allPoints.length == 0)
    return result;
  let bucketLengthUnix = ((_.last(allPoints).unix - _.first(allPoints).unix) / UNIX_TO_INDEX_MAP_PRECISION);
  let firstUnixFrom = _.first(allPoints).unix;
  let indexOfElement = 0;
  for (let i=0; i < UNIX_TO_INDEX_MAP_PRECISION; i++) {
    let unixFrom = firstUnixFrom + i*bucketLengthUnix;
    let unixTo = firstUnixFrom + (i+1)*bucketLengthUnix;
    indexOfElement = findFirstIndexMeetingUnixFrom(allPoints, unixFrom, indexOfElement);
    result.set(unixFrom, indexOfElement);
  }
  return result;
}

export const hpTimeSeriesChartCalculations = {
  getTimeSeriesBuckets,
  getTimeSeriesChartBuckets,
  getBucketForTime,
  createUnixToIndexMap,
}