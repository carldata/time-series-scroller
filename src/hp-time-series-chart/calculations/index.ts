import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries } from '../interfaces';
import { ITimeSeries } from '../state/time-series';
import { IDateTimePoint } from '../state/date-time-point';
import { IChartZoomSettings } from '../state/chart-zoom-settings';
import { EnumZoomSelected } from '../state/enums';
import { IHpTimeSeriesChartState } from '../state';
import { IChartTimeSeriesBuckets, ITimeSeriesBucket } from './interfaces';

const debug = true;

enum EnumBrowseDirection {
  Backward,
  Forward
}

const constructBucket = (allData: IDateTimePoint[],
                         referenceBucket: ITimeSeriesBucket,
                         delta: number,
                         bucketLengthUnix: number): ITimeSeriesBucket => 
{
  let result = <ITimeSeriesBucket>{
    unixFrom: referenceBucket.unixFrom + delta * bucketLengthUnix,
    unixTo: referenceBucket.unixFrom + (delta + 1) * bucketLengthUnix,
  }
  let sampleValues = _.map(_.filter(allData, (el: IDateTimePoint) => el.unix >= result.unixFrom && el.unix <= result.unixTo),
    (el: IDateTimePoint) => el.value);
  result.minY = _.min(sampleValues);
  result.maxY = _.min(sampleValues);
  result.date = new Date(result.unixFrom);
  return result;
}

const getNonemptyBucket = (allData: IDateTimePoint[],
                           buckets: ITimeSeriesBucket[],
                           browseDirection: EnumBrowseDirection,
                           bucketLengthUnix: number,
                           filterFrom?: number,
                           filterTo?: number): ITimeSeriesBucket => 
{
  let boundaries = {
    firstSampleUnix: _.first(allData).unix,
    lastSampleUnix: _.last(allData).unix
  };
  let delta = (browseDirection == EnumBrowseDirection.Backward) ? -1 : 0;
  let referenceBucket = constructBucket(allData,
    browseDirection == EnumBrowseDirection.Backward ? _.first(buckets) : _.last(buckets),
    delta,
    bucketLengthUnix);
  while (referenceBucket.unixTo >= boundaries.firstSampleUnix &&
    referenceBucket.unixFrom <= boundaries.lastSampleUnix &&
    !_.isNumber(referenceBucket.minY)) {
    delta = delta + (browseDirection == EnumBrowseDirection.Backward ? -1 : +1);
    referenceBucket = constructBucket(allData,
      browseDirection == EnumBrowseDirection.Backward ? _.first(buckets) : _.last(buckets),
      delta,
      bucketLengthUnix);
  }
  return _.isNumber(referenceBucket.minY) ? referenceBucket : null;
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

const getTimeSeriesBuckets = (allData: IDateTimePoint[], 
                              numberOfBuckets: number,
                              filterFrom?: number,
                              filterTo?: number): IChartTimeSeriesBuckets => 
{
  let filteredData = allData;
  if (_.isNumber(filterFrom))
    filteredData = _.filter(filteredData, (el: IDateTimePoint) => el.unix >= filterFrom);
  else
    filterFrom = _.first(allData).unix;
  if (_.isNumber(filterTo))
    filteredData = _.filter(filteredData, (el: IDateTimePoint) => el.unix <= filterTo);
  else
    filterTo = _.last(allData).unix;
  if (filteredData.length == 0)
    return {
      buckets: [],
      shadowPreceding: getBucketOutside(allData, EnumBrowseDirection.Backward, filterFrom, filterTo),
      shadowSucceeding: getBucketOutside(allData, EnumBrowseDirection.Forward, filterFrom, filterTo)
    };
  if (filteredData.length == 1)
    return {
      buckets: [<ITimeSeriesBucket>{
        unixFrom: _.first(filteredData).unix,
        unixTo: _.first(filteredData).unix,
        date: _.first(filteredData).date,
        minY: _.first(filteredData).value,
        maxY: _.first(filteredData).value,
      }],
      shadowPreceding: getBucketOutside(allData, EnumBrowseDirection.Backward, filterFrom, filterTo),
      shadowSucceeding: getBucketOutside(allData, EnumBrowseDirection.Forward, filterFrom, filterTo)
    };
  let buckets: ITimeSeriesBucket[] = [];
  let bucketLengthUnix = (filterTo - filterFrom) / numberOfBuckets;
  let referenceBucket: ITimeSeriesBucket = null;
  for (let el of filteredData) {
    if ((referenceBucket == null) || (referenceBucket.unixTo < el.unix)) {
      let bucketIndex = _.floor((el.unix - filterFrom) / bucketLengthUnix);
      referenceBucket = <ITimeSeriesBucket> {
        unixFrom: filterFrom + bucketIndex*bucketLengthUnix,
        unixTo: filterFrom + (bucketIndex+1)*bucketLengthUnix,
        date: new Date(filterFrom + (bucketIndex+0.5)*bucketLengthUnix),
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

/**
 * The theoretical distance between of two consecutive points in series provided as argument.
 * measured in pixels (in horizontal, x-scale). Note: this distance can be (and very often is)
 * in <0, 1> range.
 */
const getHorizontalSampleDistancePx = (series: any[], widthPx: number) => {
  return series.length > 1 ? (widthPx / (series.length - 1)) : widthPx;
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
                                   numberOfBuckets: number): IChartTimeSeries => 
{
  let unixFrom = from.getTime();
  let unixTo = to.getTime();
  let buckets = getTimeSeriesBuckets(series.points, numberOfBuckets, unixFrom, unixTo);
  return {
    name: series.name,
    color: series.color,
    buckets: buckets
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