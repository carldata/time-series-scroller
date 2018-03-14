import * as _ from 'lodash';
import * as d3 from 'd3';
import * as React from 'react';
import { ITimeSeriesBucket } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';

interface IAreaTimePoint {
  x: Date;
  y0: number;
  y1: number;
}

// Line-Time-Series prefix in key name must stay here, since DottedLine type of series draws two types of chart one one another
const getTimeSeriesKey = (ctx: ITimeSeriesRendererContext) => `Line-Time-Series|${ctx.ts.name}|${ctx.ts.fragmentId}`

const transformBucketsToAreaTimeSeries = (buckets: ITimeSeriesBucket[]): IAreaTimePoint[] => {
  let result: IAreaTimePoint[] = [];
  _.each(buckets, (b: ITimeSeriesBucket) => {
    switch (b.numberOfSamples) {
      case 1:
        result.push({ x: b.date, y0: b.minY, y1: b.minY });
        break;
      case 2:
        result.push({ x: new Date(b.firstSample.unix), y0: b.firstSample.value, y1: b.firstSample.value });
        result.push({ x: new Date(b.lastSample.unix), y0: b.lastSample.value, y1: b.lastSample.value });
        break;
      default:
        result.push({ x: new Date(b.firstSample.unix), y0: b.firstSample.value, y1: b.firstSample.value });
        result.push({ x: b.date, y0: b.minY, y1: b.maxY });
        result.push({ x: new Date(b.lastSample.unix), y0: b.lastSample.value, y1: b.lastSample.value });
        break;
    }
  });
  return result;
}

const getSvgAreaPath = (ctx: ITimeSeriesRendererContext): string => {
  let self = this;

  let area = d3.area()
    .x(function(d: IAreaTimePoint) { 
      return ctx.xScale(d.x); 
    })
    .y0(function(d: IAreaTimePoint) { return ctx.yScale(d.y0); })
    .y1(function(d: IAreaTimePoint) { return ctx.yScale(d.y1); });

  let buckets = _.concat(_.isObject(ctx.ts.buckets.shadowPreceding) ? [ctx.ts.buckets.shadowPreceding] : [], 
                         ctx.ts.buckets.buckets,
                         _.isObject(ctx.ts.buckets.shadowSucceeding) ? [ctx.ts.buckets.shadowSucceeding] : []);

  return area(transformBucketsToAreaTimeSeries(buckets));
}

export const renderLineTimeSeries = (ctx: ITimeSeriesRendererContext): JSX.Element =>
  (<path 
    key={getTimeSeriesKey(ctx)}
    d={getSvgAreaPath(ctx)} 
    fill={ctx.ts.color} 
    stroke={ctx.ts.color} />);