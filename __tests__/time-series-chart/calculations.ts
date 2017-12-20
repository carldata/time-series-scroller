import { hpTimeSeriesChartReducerAuxFunctions } from '../../src/hp-time-series-chart/reducers';
import { hpTimeSeriesChartCalculations } from '../../src/hp-time-series-chart/calculations';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IDateTimePoint } from '../../src/hp-time-series-chart/state/date-time-point';

describe("time-series-chart calculations test", () => {
  const convertToDateTimePointArray = (start: Date, deltas: number[]): IDateTimePoint[] => {
    let result: IDateTimePoint[] = [];
    for (const delta of deltas) {
      result.push({
        date: dateFns.addMinutes(start, delta),
        value: _.random(-100, 100),
        unix: dateFns.addMinutes(start, delta).getTime(),
        event: false
      });
    }
    return result;
  }
  
  const regularSeries = (lengthHours: number, granualityMinutes: number): IDateTimePoint[] => 
    convertToDateTimePointArray(new Date(2016, 2, 1), 
                                _.times(lengthHours*(60/granualityMinutes), i => i*granualityMinutes))

  const unevenDeltas = [0, 10, 11, 12, 31, 32, 33, 34, 35, 40, 45, 55, 56, 57, 58, 59, 60];
  const notEvenlyDistributedSeries = convertToDateTimePointArray(new Date(2016, 0, 15), unevenDeltas);
  
  it('evenly distributed time series is placed into buckets properly', () => {
    let hours = _.random(1, 24);
    let distribution = [1, 2, 5, 10, 15, 30, 60][_.random(0, 6)];
    let numberOfBuckets = _.random(100, 2000);
    let series = regularSeries(hours, distribution);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(series, numberOfBuckets);
    console.log(`Running with hours: ${hours}, distribution: ${distribution}, numberOfBuckets: ${numberOfBuckets}`);
    expect(result.buckets.length).toBe(series.length >= numberOfBuckets ? numberOfBuckets : series.length);
  });

  it('not-evenly distributed time series is placed into buckets properly', () => {
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, 4);
    expect(result.buckets.length).toBe(4);
  });

  it('buckets are fed with proper data', () => {
    let minutes = _.random(6*60, 12*60);
    const startDate = new Date(2016, 0, 1);
    const series = hpTimeSeriesChartReducerAuxFunctions.hourIsEvenDateTimePoints(startDate, dateFns.addMinutes(startDate, minutes));
    let numberOfBuckets = _.random(5, 20);
    let division = _.random(3, 12);
    let buckets = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(series, 
                                                                     numberOfBuckets,
                                                                     dateFns.addMinutes(startDate, minutes/division).getTime(), 
                                                                     dateFns.addMinutes(startDate, division*minutes/(division+1)).getTime());
    console.log(`Running with minutes: ${minutes}, numberOfBuckets: ${numberOfBuckets}, division: ${division}`);
    _.each(buckets.buckets, b => {
      if (dateFns.getHours(b.unixFrom) == dateFns.getHours(b.unixTo)) {
        expect(b.min).toEqual(b.max);
        _.isNumber(b.min) ? expect(b.min).toEqual((dateFns.getHours(b.unixFrom) % 2 ? 1 : 0)) : null;
      }
    });
  });

  it('transforming not-evenly distributed series to buckets returns empty buckets under specific filter conditions', () => {
    let from = dateFns.addMinutes(new Date(2016, 0, 15), 25).getTime();
    let to = dateFns.addMinutes(new Date(2016, 0, 15), 35).getTime();
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, 5, from, to);
    console.log(JSON.stringify(notEvenlyDistributedSeries));
    console.log(JSON.stringify(result));
    expect(result.buckets.length).toBe(5);
    for (let bucket of result.buckets) {
      expect(bucket.min).not.toBe(undefined);
      expect(bucket.max).not.toBe(undefined); 
      expect(bucket.unixFrom).toEqual(bucket.unixTo);
    }
  });

  it('transforming not-evenly distributed series to buckets returns shadow buckets correctly under specific filter conditions', () => {
    let from = dateFns.addMinutes(new Date(2016, 0, 15), 25).getTime();
    let to = dateFns.addMinutes(new Date(2016, 0, 15), 35).getTime();
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, 5, from, to);
    expect(result.shadowPreceding.unixFrom).toBe(1452813060000);
    expect(result.shadowPreceding.unixTo).toBe(1452813180000);
    expect(result.shadowPreceding.min).not.toBe(undefined);
    expect(result.shadowSucceeding).toBe(null);
  });
});