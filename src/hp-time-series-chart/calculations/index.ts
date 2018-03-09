import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IUnixTimePoint } from '../state/unix-time-point';
import { IChartZoomSettings } from '../state/chart-zoom-settings';
import { EnumZoomSelected } from '../state/enums';
import { IHpTimeSeriesChartState } from '../state';
import { IChartTimeSeriesBuckets, ITimeSeriesBucket } from './interfaces';
import { csvLoadingCalculations } from '../csv-loading/calculations';
import { unixIndexMapCalculations } from './unix-index-map';
import { IHpTimeSeriesChartTimeSeries, IOnScreenTimeSeries } from '../state/time-series';

const debug = true;

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
      leftboundY: sample.value,
      rightboundY: sample.value,
      unixFrom: browseDirection == EnumBrowseDirection.Backward ? filterFrom : filterTo,
      unixTo: browseDirection == EnumBrowseDirection.Backward ? filterFrom : filterTo
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


export const hpTimeSeriesChartCalculations = {
  getTimeSeriesBuckets,
  convertToOnScreenTimeSeries,
}