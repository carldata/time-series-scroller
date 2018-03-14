import * as _ from 'lodash';
import * as d3 from 'd3';
import * as React from 'react';
import { ITimeSeriesBucket } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';
import { SvgCircle } from './svg-circle';

// Dot-Time-Series prefix in key name must stay here, since DottedLine type of series draws two types of chart one one another
const getTimeSeriesKey = (ctx: ITimeSeriesRendererContext) => `Dot-Time-Series|${ctx.ts.name}|${ctx.ts.fragmentId}`

const getCircleKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket) =>
  `${ts.name}|${ts.fragmentId}|${b.sourceUnixFrom}|${b.sourceUnixTo}`;

const renderSvgCircles = (ctx: ITimeSeriesRendererContext): JSX.Element[] => {
  let result = [];
  for (let b of ctx.ts.buckets.buckets) {
    let unixAvg = b.unixFrom+(b.unixTo-b.unixFrom)/2;
    if (b.numberOfSamples == 1)
      result.push(<SvgCircle key={getCircleKey(ctx.ts, b)} ctx={ctx} unix={unixAvg} y={b.maxY} />)
  }
  return result;
}

export const renderDotTimeSeries = (ctx: ITimeSeriesRendererContext): JSX.Element =>
  <g key={getTimeSeriesKey(ctx)}>{renderSvgCircles(ctx)}</g>;