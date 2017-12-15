// import { getTimeSeriesBuckets } from '../../src/hp-time-series-chart/calculations';
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
				envelopeValueMax: 0,
				envelopeValueMin: 0,
				value: _.random(-100, 100),
				unix: dateFns.addMinutes(start, delta).getTime(),
				event: false
			});
		}
		return result;
	}
	
	const evenSeries = (lengthHours: number, granualityMinutes: number): IDateTimePoint[] => 
		convertToDateTimePointArray(new Date(2016, 2, 1), 
		                            _.times(lengthHours*(60/granualityMinutes), i => i*granualityMinutes))

	it('evenly distributed time series is placed into buckets properly', () => {
		let hours = _.random(1, 24);
		let distribution = [1, 2, 5, 10, 15, 30, 60][_.random(0, 6)];
		let numberOfBuckets = _.random(100, 2000);
		let buckets = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(evenSeries(hours, distribution), numberOfBuckets);
		console.log(`Running with hours: ${hours}, distribution: ${distribution}, numberOfBuckets: ${numberOfBuckets}`);
		expect(buckets.length).toBe(numberOfBuckets);
		expect(_.reduce(buckets, (acc, b) => acc + b.samples.length, 0)).toBeGreaterThanOrEqual(hours*60/distribution);
	});

	it('not-evenly distributed time series is placed into buckets properly', () => {
		let deltas = [0, 10, 11, 12, 31, 32, 33, 34, 35, 40, 45, 55, 56, 57, 58, 59, 60];
		let series = convertToDateTimePointArray(new Date(2016, 0, 15), deltas);
		let buckets = hpTimeSeriesChartCalculations.getTimeSeriesBuckets(series, 4);
		expect(buckets.length).toBe(4);
		expect(_.reduce(buckets, (acc, b) => acc + b.samples.length, 0)).toBeGreaterThanOrEqual(deltas.length);
		expect(buckets[0].samples.length).toBe(4); //samples of 0-15 minutes inclusive
		expect(buckets[1].samples.length).toBe(0); //samples of 15-30 minutes inclusive
		expect(buckets[2].samples.length).toBe(7); //samples of 30-45 minutes inclusive
		expect(buckets[3].samples.length).toBe(7); //samples of 45-60 minutes inclusive
	});
});