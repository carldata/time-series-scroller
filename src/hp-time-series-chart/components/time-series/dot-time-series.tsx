import * as _ from 'lodash';
import * as d3 from 'd3';
import * as React from 'react';
import { ITimeSeriesBucket } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';

const getCircleKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket, unix: number, y: number) => 
  `${ts.name}|${b.unixFrom}|${b.unixTo}|${unix}|${y}`

const getCircleRadius = (b: ITimeSeriesBucket) => {
  return 2;
}

const renderSvgCircles = (ctx: ITimeSeriesRendererContext): JSX.Element[] => {
  let result = [];
  let bucketsToDisplay = _.filter(ctx.ts.buckets.buckets, (b: ITimeSeriesBucket) => 
    _.isNumber(b.minY) && _.isNumber(b.maxY) && _.isNumber(b.leftboundY) && _.isNumber(b.rightboundY));
  for (let b of bucketsToDisplay) {
    let unixAvg = b.unixFrom+(b.unixTo-b.unixFrom)/2;
    if (b.numberOfSamples == 1) {
      result.push(<circle 
        key={getCircleKey(ctx.ts, b, unixAvg, b.maxY)} 
        cx={ctx.xScale(new Date(unixAvg))} 
        cy={ctx.yScale(b.maxY)} 
        fill={ctx.ts.color} 
        r={getCircleRadius(b)} />);
    }
    if (b.numberOfSamples >= 2) {
      result.push(<circle 
        key={getCircleKey(ctx.ts, b, b.unixFrom, b.leftboundY)} 
        cx={ctx.xScale(b.unixFrom)} 
        cy={ctx.yScale(b.leftboundY)} 
        fill={ctx.ts.color} 
        r={getCircleRadius(b)} />);
      if (b.rightboundY != b.leftboundY)
        result.push(<circle 
          key={getCircleKey(ctx.ts, b, b.unixTo, b.rightboundY)} 
          cx={ctx.xScale(b.unixTo)} 
          cy={ctx.yScale(b.rightboundY)} 
          fill={ctx.ts.color} 
          r={getCircleRadius(b)} />);
    }
    if (b.numberOfSamples > 2) {
      result.push(<circle 
        key={getCircleKey(ctx.ts, b, unixAvg, b.minY)} 
        cx={ctx.xScale(unixAvg)} 
        cy={ctx.yScale(b.minY)} 
        fill={ctx.ts.color} 
        r={getCircleRadius(b)} />);
      if (b.maxY != b.minY) 
        result.push(<circle 
          key={getCircleKey(ctx.ts, b, unixAvg, b.maxY)} 
          cx={ctx.xScale(unixAvg)} 
          cy={ctx.yScale(b.maxY)} 
          fill={ctx.ts.color} 
          r={getCircleRadius(b)} />);
    }
  }
  return result;
}

export const renderDotTimeSeries = (ctx: ITimeSeriesRendererContext): JSX.Element =>
  <g key={ctx.ts.name}>{renderSvgCircles(ctx)}</g>;