import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import * as fs from 'fs';
import { hpTimeSeriesChartCalculations } from '../../src/hp-time-series-chart/calculations';
import { IUnixTimePoint } from '../../src/hp-time-series-chart/state/unix-time-point';
import { csvLoadingCalculations } from '../../src/hp-time-series-chart/csv-loading/calculations';
import { unixIndexMapCalculations } from '../../src/hp-time-series-chart/calculations/unix-index-map';
import { hpTimeSeriesChartReducerAuxFunctions } from '../../src/hp-time-series-chart/reducers-aux';

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

  it('buckets reflects max/min values of time-series', () => {
    const numberOfTrials = 20;
    const unixFrom = new Date().getTime();
    const unixTo = dateFns.addDays(unixFrom, 365).getTime();
    const allData = hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(new Date(unixFrom), new Date(unixTo));
    const unixIndexMap = unixIndexMapCalculations.createUnixToIndexMap(allData);
    const filterFrom = _.random(unixFrom, _.floor(unixFrom + (unixTo-unixFrom)/2)-1);
    const filterTo = _.times(numberOfTrials, (i) => {
      if (_.inRange(i, 0, 5)) {
        return filterFrom + _.random(3600*1000, 2*24*3600*1000);
      }
      return _.random(_.floor(unixFrom + (unixTo-unixFrom)/2), unixTo);
    })
    _.times(numberOfTrials, (i) => {
      const numberOfBuckets = _.random(500, 2400);
      const filteredData = _.filter(allData, (el: IUnixTimePoint) => el.unix >= filterFrom && el.unix <= filterTo[i]);
      const buckets = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(allData, unixIndexMap, numberOfBuckets, filterFrom, filterTo[i]);
      const [dataMin, dataMax] = ((values) => [_.min(values), _.max(values)])(_.map(filteredData, el => el.value));
      const bucketMin = _.min(_.map(buckets.buckets, el => el.minY));
      const bucketMax = _.max(_.map(buckets.buckets, el => el.maxY));
      const failedTimeSeriesWithParamtersFileName = `./test-failed-time-series.${numberOfBuckets}.${new Date(filterFrom)}.${new Date(filterTo[i])}.json`;
      try {
        expect(dataMin).toEqual(bucketMin);
        expect(dataMax).toEqual(bucketMax);
      }
      catch (err) {
        fs.writeFile(failedTimeSeriesWithParamtersFileName, JSON.stringify(allData), function(err) {
          if (err) {
            return console.log(err);
          }
          console.log(`The failed test has been written to ${failedTimeSeriesWithParamtersFileName}`);
        });
        throw err;
      }
    })
  });
  
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

  it('square (hourly) wave', () => {
    let minutes = _.random(6*60, 12*60);
    const startDate = new Date(2016, 0, 1);
    const series = hpTimeSeriesChartReducerAuxFunctions.squareWaveTimePoints(startDate, dateFns.addMinutes(startDate, minutes));
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
      expect(bucket.firstSample).not.toBe(undefined); 
      expect(bucket.lastSample).not.toBe(undefined); 
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