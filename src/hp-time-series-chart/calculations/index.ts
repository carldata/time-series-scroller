import { ITimeSeriesBucket } from './time-series-bucket';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IChartTimeSeries } from '../interfaces';
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
      date: _.first(data).date,
      min: _.first(data).value,
      max: _.first(data).value,
    }];
  const bucketLengthUnix = (_.last(data).unix - _.first(data).unix) / numberOfBuckets;
  const buckets =_.times<ITimeSeriesBucket>(numberOfBuckets, (n) => <ITimeSeriesBucket>{ 
    unixFrom: _.first(data).unix + n*bucketLengthUnix,
    unixTo: _.first(data).unix + (n+1)*bucketLengthUnix,
    date: new Date(_.first(data).unix + n*bucketLengthUnix),
    min: undefined,
    max: undefined
  });
  let bucketIndex = 0;
  let currentBucket = _.find(buckets, (b: ITimeSeriesBucket) => _.inRange(_.first(data).unix, b.unixFrom, b.unixTo)); 
  if (_.isUndefined(currentBucket))
    return;
  for (let el of data) {
    currentBucket.max = (_.isUndefined(currentBucket.max) || el.value > currentBucket.max) ? el.value : currentBucket.max; 
    currentBucket.min = (_.isUndefined(currentBucket.min) || el.value < currentBucket.min) ? el.value : currentBucket.min; 
    if ((el.unix >= currentBucket.unixFrom) && (bucketIndex < buckets.length-1)) {
      bucketIndex++;
      currentBucket = buckets[bucketIndex];
    }
  }
  return buckets;
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
 * ITimeSeriesChartBuckets is chart-adopted representation of time series, 
 * it has NOT such things like cache objects or the full timing of points.
 */
const getTimeSeriesChartBuckets = (series: ITimeSeries,
                                   from: Date, 
                                   to: Date, 
                                   numberOfBuckets: number): IChartTimeSeries => {  
  let unixFrom = from.getTime();
  let unixTo = to.getTime();
  let dateFromToFiltered = _.filter(series.points, (p: IDateTimePoint)  => p.unix >= unixFrom && p.unix <= unixTo);
  let buckets = _.filter(getTimeSeriesBuckets(dateFromToFiltered, numberOfBuckets),
    (b: ITimeSeriesBucket) => _.isNumber(b.min));
  return {
    name: series.name,
    color: series.color,
    buckets: buckets,
    lefthandBucket: null,
    righthandBucket: null
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

export const hpTimeSeriesChartCalculations = {
  getTimeSeriesBuckets: getTimeSeriesBuckets,
  getTimeSeriesChartBuckets: getTimeSeriesChartBuckets,
  translateDateTimeToSecondsDomain: translateDateTimeToUnixSecondsDomain,
  calculateDomainLengthSeconds: calculateDomainLengthSeconds,
  translateUnixSecondsDomainToDateTime: translateSecondsDomainToDateTime,
}