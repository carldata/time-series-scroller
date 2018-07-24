import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IUnixTimePoint } from '../state/unix-time-point';
import { IHpTimeSeriesChartState } from '../state';
import { IChartTimeSeriesBuckets, ITimeSeriesBucket } from './interfaces';
import { unixIndexMapCalculations } from './unix-index-map';
import { IHpTimeSeriesChartTimeSeries, IOnScreenTimeSeries } from '../state/time-series';
import { TimeSeries } from '../components/time-series';

enum EnumBrowseDirection {
  Backward,
  Forward
}

const getBucketOutside = (allData: IUnixTimePoint[],
                          browseDirection: EnumBrowseDirection,
                          filterFrom: number,
                          filterTo: number): ITimeSeriesBucket => 
{
  let sample = browseDirection == EnumBrowseDirection.Backward ?
    _.last(_.filter(allData, (el: IUnixTimePoint) => el.unix <= filterFrom)) :
    _.first(_.filter(allData, (el: IUnixTimePoint) => el.unix >= filterTo));
  return _.isObject(sample) ?
    <ITimeSeriesBucket>{
      minY: sample.value,
      maxY: sample.value,
      date: new Date(sample.unix),
      numberOfSamples: 1,
      firstSample: sample,
      lastSample: sample,
      unixFrom: sample.unix,
      unixTo: sample.unix
    } : null;
}

const getTimeSeriesBuckets = (allData: IUnixTimePoint[],
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
  let indexFrom = unixIndexMapCalculations.findIndexToBrowsePointsFrom(allData, unixToIndexMap, filterFrom);
  let buckets: ITimeSeriesBucket[] = [];
  let referenceBucket: ITimeSeriesBucket = null;
  for (let i = indexFrom; i < allData.length; i++) {
    let el = allData[i];
    if (el.unix > filterTo) {
      break;
    }
    if ((referenceBucket == null) || (referenceBucket.unixTo < el.unix)) {
      let bucketIndex = _.floor((el.unix - filterFrom) / bucketLengthUnix);
      referenceBucket = <ITimeSeriesBucket>{
        unixFrom: filterFrom + bucketIndex * bucketLengthUnix,
        unixTo: filterFrom + (bucketIndex + 1) * bucketLengthUnix,
        firstSample: el,
        lastSample: el,
        date: new Date(filterFrom + (bucketIndex + 0.5) * bucketLengthUnix),
        numberOfSamples: 0,
        minY: el.value,
        maxY: el.value,
      }
      buckets.push(referenceBucket);
    }
    referenceBucket.lastSample = el;
    referenceBucket.numberOfSamples++;
    referenceBucket.minY = el.value < referenceBucket.minY ? el.value : referenceBucket.minY;
    referenceBucket.maxY = el.value > referenceBucket.maxY ? el.value : referenceBucket.maxY;
  }
  return {
    buckets: _.filter(buckets, b => b.unixFrom >= filterFrom && b.unixTo <= filterTo),
    shadowPreceding: getBucketOutside(allData, EnumBrowseDirection.Backward, filterFrom, filterTo),
    shadowSucceeding: getBucketOutside(allData, EnumBrowseDirection.Forward, filterFrom, filterTo)
  } as IChartTimeSeriesBuckets;
}

const convertToOnScreenTimeSeries = (series: IHpTimeSeriesChartTimeSeries[],
                                     unixFrom: number,
                                     unixTo: number,
                                     numberOfBuckets: number): IOnScreenTimeSeries[] => {
  let grouped: IHpTimeSeriesChartTimeSeries[][] = _.toArray(_.groupBy(series, (ts: IHpTimeSeriesChartTimeSeries)  => ts.name));
  return _.reduce(grouped, (acc: IOnScreenTimeSeries[], col: IHpTimeSeriesChartTimeSeries[]) => {
    return _.concat(acc, _.map<IHpTimeSeriesChartTimeSeries, IOnScreenTimeSeries>(col, ts => 
      <IOnScreenTimeSeries> {
        name: ts.name,
        fragmentId: _.indexOf(col, ts),
        color: ts.color,
        buckets: getTimeSeriesBuckets(ts.points, ts.unixToIndexMap, numberOfBuckets, unixFrom, unixTo),
        type: ts.type
      }
    ))
  }, []);
}


/**
 * Finds yMin, yMax based on windowUnixFrom, windowUnixTo of state: IHpTimeSeriesChartState
 * Might be useful for dynamic scaling of Y-axis based on the scroller date range
 */
const findMinMaxValuesBasedOnWindow = (state: IHpTimeSeriesChartState): { yMin: number, yMax: number } => {
  if ((state.dateRangeUnixFrom === state.windowUnixFrom) &&
      (state.dateRangeUnixTo === state.windowUnixTo)) {
    return {
      yMin: state.yMin,
      yMax: state.yMax,
    };
  }
  const pointsFiltered = (points: IUnixTimePoint[]): IUnixTimePoint[] =>
    _.filter(points, (p) => _.inRange(p.unix, state.windowUnixFrom, state.windowUnixTo));

  return {
    yMin: _.min(_.map(state.series, (x) => _.min(_.map(pointsFiltered(x.points), (y) => y.value)))),
    yMax: _.max(_.map(state.series, (x) => _.max(_.map(pointsFiltered(x.points), (y) => y.value)))),
  };
};

/**
 * Creates Map<number, number> out of time series provided, holding (point) unix (*) as the key and (point) value as the value.
 *  
 * (*) number of milliseconds since January 1, 1970, 00:00:00 UTC, with leap seconds ignored) 
 * see also https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
 * @param timeSeries 
 */
const mapifyTimeSeries = (timeSeries: TimeSeries): Map<number, number> => 
  _.reduce(timeSeries, (map, el) => {
    map.set(el.unix, el.value);
    return map;
  }, new Map<number, number>())

export const hpTimeSeriesChartCalculations = {
  getTimeSeriesBuckets,
  convertToOnScreenTimeSeries,
  findMinMaxValuesBasedOnWindow,
  mapifyTimeSeries,
}