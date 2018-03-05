import { hpTimeSeriesChartReducerAuxFunctions } from '../../src/hp-time-series-chart/reducers';
import { hpTimeSeriesChartCalculations } from '../../src/hp-time-series-chart/calculations';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IUnixTimePoint } from '../../src/hp-time-series-chart/state/unix-time-point';
import { csvLoadingCalculations } from '../../src/hp-time-series-chart/csv-loading/calculations';
import { unixIndexMapCalculations } from '../../src/hp-time-series-chart/calculations/unix-index-map';

describe("time-series-chart calculations test", () => {
  const convertToDateTimePointArray = (start: Date, deltas: number[]): IUnixTimePoint[] => {
    let result: IUnixTimePoint[] = [];
    for (const delta of deltas) {
      result.push({
        value: _.random(-100, 100),
        unix: dateFns.addMinutes(start, delta).getTime()
      });
    }
    return result;
  }
  
  const regularSeries = (lengthHours: number, granualityMinutes: number): IUnixTimePoint[] => 
    convertToDateTimePointArray(new Date(2016, 2, 1), 
                                _.times(lengthHours*(60/granualityMinutes), i => i*granualityMinutes))

  const unevenDeltas = [0, 10, 11, 12, 31, 32, 33, 34, 35, 40, 45, 55, 56, 57, 58, 59, 60];
  const notEvenlyDistributedSeries = convertToDateTimePointArray(new Date(2016, 0, 15), unevenDeltas);
  
  it('evenly distributed time series is placed into buckets properly', () => {
    let hours = _.random(1, 24);
    let distribution = [1, 2, 5, 10, 15, 30, 60][_.random(0, 6)];
    let numberOfBuckets = _.random(100, 2000);
    let series = regularSeries(hours, distribution);
    let map = unixIndexMapCalculations.createUnixToIndexMap(series);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(series, map, numberOfBuckets);
    expect(result.buckets.length).toBeGreaterThan(0);
    expect(result.buckets.length).toBeLessThanOrEqual(numberOfBuckets);
  });

  it('time series is transformed to no empty buckets', () => {
    let map = unixIndexMapCalculations.createUnixToIndexMap(notEvenlyDistributedSeries);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, map, 4);
    expect(result.buckets.length).toBe(3);
  });

  it('buckets are fed with proper data', () => {
    let minutes = _.random(6*60, 12*60);
    const startDate = new Date(2016, 0, 1);
    const series = hpTimeSeriesChartReducerAuxFunctions.hourIsEvenDateTimePoints(startDate, dateFns.addMinutes(startDate, minutes));
    let numberOfBuckets = _.random(5, 20);
    let division = _.random(3, 12);
    let map = unixIndexMapCalculations.createUnixToIndexMap(series);
    let buckets = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(series, 
                                                                     map, 
                                                                     numberOfBuckets,
                                                                     dateFns.addMinutes(startDate, minutes/division).getTime(), 
                                                                     dateFns.addMinutes(startDate, division*minutes/(division+1)).getTime());
    console.log(`Running with minutes: ${minutes}, numberOfBuckets: ${numberOfBuckets}, division: ${division}`);
    _.each(buckets.buckets, b => {
      if (dateFns.getHours(b.unixFrom) == dateFns.getHours(b.unixTo)) {
        expect(b.minY).toEqual(b.maxY);
        _.isNumber(b.minY) ? expect(b.minY).toEqual((dateFns.getHours(b.unixFrom) % 2 ? 1 : 0)) : null;
      }
    });
  });

  it('not-evenly distributed series gets transformed to buckets under specific filter conditions - test A', () => {
    let from = dateFns.addMinutes(new Date(2016, 0, 15), 25).getTime();
    let to = dateFns.addMinutes(new Date(2016, 0, 15), 35).getTime();
    let map = unixIndexMapCalculations.createUnixToIndexMap(notEvenlyDistributedSeries);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, map, 5, from, to);
    expect(result.buckets.length).toBe(2);
    expect(_.sumBy(result.buckets, b => b.numberOfSamples)).toBe(5);
    for (let bucket of result.buckets) {
      expect(bucket.minY).not.toBe(undefined);
      expect(bucket.maxY).not.toBe(undefined); 
      expect(bucket.leftboundY).not.toBe(undefined); 
      expect(bucket.rightboundY).not.toBe(undefined); 
    }
  });

  it('not-evenly distributed series gets transformed to buckets under specific filter conditions - test B', () => {
    let from = dateFns.addMinutes(new Date(2016, 0, 15), 25).getTime();
    let to = dateFns.addMinutes(new Date(2016, 0, 15), 35).getTime();
    let map = unixIndexMapCalculations.createUnixToIndexMap(notEvenlyDistributedSeries);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, map, 5, from, to);
    expect(result.shadowPreceding.unixFrom).toBe(1452813900000);
    expect(result.shadowPreceding.unixTo).toBe(1452813900000);
    expect(result.shadowPreceding.minY).not.toBe(undefined);
    expect(result.shadowSucceeding).toBe(null);
  });

  it('not-evenly distributed series has no buckets but shadow buckets get found', () => {
    let from = dateFns.addMinutes(new Date(2016, 0, 15), 15).getTime();
    let to = dateFns.addMinutes(new Date(2016, 0, 15), 28).getTime();
    let map = unixIndexMapCalculations.createUnixToIndexMap(notEvenlyDistributedSeries);
    let result = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(notEvenlyDistributedSeries, map, 5, from, to);
    expect(result.shadowPreceding).not.toBe(null);
    expect(result.shadowSucceeding).not.toBe(null);
  });
});