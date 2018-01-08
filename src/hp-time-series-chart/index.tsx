import * as dateFns from 'date-fns';
import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Dots } from './components/dots';
import { IHpTimeSeriesChartState } from './state';
import { hpTimeSeriesChartCalculations } from './calculations';
import { IChartDimensions, IChartTimeSeries } from './interfaces';
import { IDateTimePoint } from './state/date-time-point';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { TimeSeries } from './components/time-series';
import { DateTimeAxis } from './components/date-time-axis';
import { ValueAxis } from './components/value-axis';

export interface IHpTimeSeriesChartProps {
  state: IHpTimeSeriesChartState;
  chartDimensions: IChartDimensions;
}

export const HpTimeSeriesChart = (props: IHpTimeSeriesChartProps) => {
  const getXScale = () => {
    return d3.scaleTime()
      .domain([props.state.windowUnixFrom, props.state.windowUnixTo])
      .range([props.chartDimensions.timeSeriesChartPaddingLeft, 
        props.chartDimensions.canvasWidth - props.chartDimensions.timeSeriesChartPaddingLeft - props.chartDimensions.timeSeriesChartPaddingRight]);
  };
  
  const getYScale = () => {
    return d3.scaleLinear()
      .domain([props.state.yMin, props.state.yMax])
      .range([props.chartDimensions.canvasHeight - props.chartDimensions.timeSeriesChartPaddingTop - props.chartDimensions.timeSeriesChartPaddingBottom, 
        props.chartDimensions.timeSeriesChartPaddingTop]);
  };

  let chartTimeSeries: IChartTimeSeries[] = _.map(props.state.series, 
    ts => hpTimeSeriesChartCalculations.getTimeSeriesChartBuckets(ts,
                                                                  props.state.windowUnixFrom, 
                                                                  props.state.windowUnixTo,
                                                                  props.chartDimensions.canvasWidth));
  let xScale = getXScale();
  let yScale = getYScale();
  return (
    <svg 
      width={props.chartDimensions.canvasWidth} 
      height={props.chartDimensions.canvasHeight}>
      <TimeSeries 
        xScale={xScale} 
        yScale={yScale}
        chartTimeSeries={chartTimeSeries}
        chartDimensions={props.chartDimensions} 
      />
      <DateTimeAxis xScale={xScale} chartDimensions={props.chartDimensions} />
      <ValueAxis yScale={yScale} chartDimensions={props.chartDimensions} />
    </svg>
  );
  
}