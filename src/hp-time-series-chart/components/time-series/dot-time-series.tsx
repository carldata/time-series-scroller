import * as _ from 'lodash';
import * as d3 from 'd3';
import * as React from 'react';
import { ITimeSeriesBucket, IChartTimeSeriesBuckets } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';
import { SvgCircle } from './svg-circle';

export enum EnumDotRenderStrategy {
  /**
   * Shows all buckets as they are - without any filtering. 
   * Please note that doing so results in heavy performance penalty - 
   * choosing the proper strategy should depend on number of buckets / samples
   */
  ShowAll,
  /**
   * Shows samples as they are in buckets with the following restrictions:
   * a) only buckets that represent data source samples (see numberOfSamples == 1 criteria below) are shown
   * a) only buckets that are "far enough" (measured in the screen domain) are shown
   */
  ShowDataSourceProximityFiltered
}

enum EnumCircleKind {
  BucketDateMinY,
  BucketDateMaxY
}

// Dot-Time-Series prefix in key name must stay here, since DottedLine type of series draws two types of chart one one another
const getTimeSeriesKey = (ctx: ITimeSeriesRendererContext) => `Dot-Time-Series|${ctx.ts.name}|${ctx.ts.fragmentId}`

const getCircleKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket, kind: EnumCircleKind) =>
  `${ts.name}|${ts.fragmentId}|${b.firstSample.unix}|${b.lastSample.unix}|${kind}`;

const filterBuckets = (buckets: ITimeSeriesBucket[], xScale: (value: any) => any, cutoffPx: number): ITimeSeriesBucket[] => {
  interface IOnScreenTimeSeriesBucket extends ITimeSeriesBucket {
    distanceToPrecedingBucketPx: number;
    distanceToSucceedingBucketPx: number;
  }
  
  interface IReduceAccumulator {
    result: IOnScreenTimeSeriesBucket[],
    previousBucket: IOnScreenTimeSeriesBucket;
    nextBucket: IOnScreenTimeSeriesBucket;
  }
  
  let bucketsExtended = _.reduce<ITimeSeriesBucket, IReduceAccumulator>(buckets, (acc, el) => {
    let referenceBucket = _.extend(el, {
      distanceToPrecedingBucketPx: _.isObject(acc.previousBucket) ? xScale(el.firstSample.unix)-xScale(acc.previousBucket.firstSample.unix) : Number.MAX_VALUE,
      distanceToSucceedingBucketPx: Number.MAX_VALUE
    });
    acc.result.push(referenceBucket);
    if (_.isObject(acc.previousBucket))
      acc.previousBucket.distanceToSucceedingBucketPx = xScale(el.firstSample.unix)-xScale(acc.previousBucket.firstSample.unix)
    acc.previousBucket = referenceBucket;
    return acc;
  }, {
    result: [],
    previousBucket: null,
    nextBucket: null
  }).result;

  // aside from bucket to bucket estimated "distance" (see cutoffPx parameter in filter below), 
  // we need to verify if buckets have only one sample assigned (see numberOfSamples parameter in the filter below);
  // so, assumed:
  // a) minimal bucket to bucket distance criteria is met (cutoffPx), 
  // b) we keep on "zooming in" (bucket unix length gets smaller), 
  // a sample that get assigned to a bucket as the sole sample, 
  // will get assigned as the sole sample in any new bucket, 
  // no matter how bucketing gets applied

  // if got displayed circles/dots/buckets based on bucket-to-bucket distance criteria only, it might be misleading -
  // since distance between buckets can fluctuate as the bucket unix length decreases !
 
  // the "zooming in" operation (without checking for the number of samples) might result in dots appearing and 
  // (surprisingly) dissapearing, which makes the poor user experience
  
  return _.filter<IOnScreenTimeSeriesBucket>(bucketsExtended, el => (el.distanceToPrecedingBucketPx >= cutoffPx) &&
                                                                    (el.distanceToSucceedingBucketPx >= cutoffPx) && 
                                                                    (el.numberOfSamples == 1));
}

export const renderDotTimeSeries = (ctx: ITimeSeriesRendererContext, strategy: EnumDotRenderStrategy): JSX.Element => {
  switch (strategy) {
    case EnumDotRenderStrategy.ShowAll:
      return <g key={getTimeSeriesKey(ctx)}>
          {_.reduce<ITimeSeriesBucket, JSX.Element[]>(ctx.ts.buckets.buckets, (acc, b) => {
            if (b.numberOfSamples >= 1)
              acc.push(<SvgCircle key={getCircleKey(ctx.ts, b, EnumCircleKind.BucketDateMaxY)} ctx={ctx} date={b.date} y={b.maxY} />);
            if (b.numberOfSamples >= 2)
              acc.push(<SvgCircle key={getCircleKey(ctx.ts, b, EnumCircleKind.BucketDateMinY)} ctx={ctx} date={b.date} y={b.minY} />);
            return acc;
          }, [])}
        </g>;
    case EnumDotRenderStrategy.ShowDataSourceProximityFiltered:
      return <g key={getTimeSeriesKey(ctx)}>
          {_.reduce<ITimeSeriesBucket, JSX.Element[]>(filterBuckets(ctx.ts.buckets.buckets, ctx.xScale, 2), (acc, b) => {
            acc.push(<SvgCircle key={getCircleKey(ctx.ts, b, EnumCircleKind.BucketDateMaxY)} ctx={ctx} date={b.date} y={b.maxY} />);
            return acc;
          }, [])}
        </g>;
    default:
      return <g key={getTimeSeriesKey(ctx)}></g>;
  }
}
  