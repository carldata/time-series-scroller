import _ from 'lodash';
import React from 'react';
import { ITimeSeriesBucket } from "../../calculations/interfaces";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesRendererContext } from '.';
import { SvgRect } from './svg-rect';


// Dot-Time-Series prefix in key name must stay here, since DottedLine type of series draws two types of chart one one another
const getTimeSeriesKey = (ctx: ITimeSeriesRendererContext) => `Dot-Time-Series|${ctx.ts.name}|${ctx.ts.fragmentId}`

const getRectKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket) =>
  `${ts.name}|${ts.fragmentId}|${b.firstSample.unix}|${b.lastSample.unix}`;

export const renderBarTimeSeries = (ctx: ITimeSeriesRendererContext): JSX.Element => {
  return <g key={getTimeSeriesKey(ctx)}>
      {_.map<ITimeSeriesBucket, JSX.Element>(ctx.ts.buckets.buckets, (b) =>
        <SvgRect
          ctx={ctx}
          date={new Date(b.unixFrom)}
          y={b.maxY}
          key={getRectKey(ctx.ts, b)} />)}
    </g>;
}