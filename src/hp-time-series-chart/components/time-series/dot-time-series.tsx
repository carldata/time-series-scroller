import * as _ from 'lodash';
import * as d3 from 'd3';
import * as React from 'react';
import { ITimeSeriesBucket, IChartTimeSeriesBuckets } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';
import { SvgCircle } from './svg-circle';

interface IOnScreenTimeSeriesBucket extends ITimeSeriesBucket {
  distanceToPrecedingBucketPx: number;
  distanceToSucceedingBucketPx: number;
}

interface IReduceAccumulator {
  result: IOnScreenTimeSeriesBucket[],
  previousBucket: IOnScreenTimeSeriesBucket;
  nextBucket: IOnScreenTimeSeriesBucket;
}

// Dot-Time-Series prefix in key name must stay here, since DottedLine type of series draws two types of chart one one another
const getTimeSeriesKey = (ctx: ITimeSeriesRendererContext) => `Dot-Time-Series|${ctx.ts.name}|${ctx.ts.fragmentId}`

const getCircleKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket) =>
  `${ts.name}|${ts.fragmentId}|${b.firstSample.unix}|${b.lastSample.unix}`;

const filterBuckets = (buckets: ITimeSeriesBucket[], xScale: (value: any) => any, cutoffMarginPx: number): ITimeSeriesBucket[] => {
  let bucketsExtended = _.reduce<ITimeSeriesBucket, IReduceAccumulator>(buckets, (acc, el) => {
    let referenceBucket = _.extend(el, {
      distanceToPrecedingBucketPx: _.isObject(acc.previousBucket) ? xScale(el.firstSample.unix)-xScale(acc.previousBucket.lastSample.unix) : Number.MAX_VALUE,
      distanceToSucceedingBucketPx: Number.MAX_VALUE
    });
    acc.result.push(referenceBucket);
    if (_.isObject(acc.previousBucket))
      acc.previousBucket.distanceToSucceedingBucketPx = xScale(el.firstSample.unix)-xScale(acc.previousBucket.lastSample.unix)
    acc.previousBucket = referenceBucket;
    return acc;
  }, {
    result: [],
    previousBucket: null,
    nextBucket: null
  }).result;
  let result = _.filter<IOnScreenTimeSeriesBucket>(bucketsExtended, el => 
    (el.distanceToPrecedingBucketPx >= cutoffMarginPx) && (el.distanceToSucceedingBucketPx >= cutoffMarginPx));
  return result;
}

const renderSvgCircles = (ctx: ITimeSeriesRendererContext, cutoffMarginPx: number): JSX.Element[] => 
  _.reduce<ITimeSeriesBucket, JSX.Element[]>(filterBuckets(ctx.ts.buckets.buckets, ctx.xScale, cutoffMarginPx), (acc, b) => {
    acc.push(<SvgCircle key={getCircleKey(ctx.ts, b)} ctx={ctx} date={b.date} y={b.maxY} />);
    return acc;
  }, []);


export const renderDotTimeSeries = (ctx: ITimeSeriesRendererContext, cutoffMarginPx: number): JSX.Element =>
  <g key={getTimeSeriesKey(ctx)}>{renderSvgCircles(ctx, cutoffMarginPx)}</g>;