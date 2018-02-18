import * as dateFns from 'date-fns';
import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Dots } from './components/dots';
import { IHpTimeSeriesChartState } from './state';
import { hpTimeSeriesChartCalculations } from './calculations';
import { IChartTimeSeries } from './interfaces';
import { IUnixTimePoint } from './state/unix-time-point';
import { IChartZoomSettings } from './state/chart-zoom-settings';
import { TimeSeries } from './components/time-series';
import { DateTimeAxis } from './components/date-time-axis';
import { ValueAxis } from './components/value-axis';
import { IHpTimeSeriesChartScss } from '../sass/styles';

export enum EnumHpTimeSeriesChartMode {
  Standalone,
  SliderEmbedded
}

export interface IHpTimeSeriesChartProps {
  state: IHpTimeSeriesChartState;
  scss: IHpTimeSeriesChartScss;
  mode?: EnumHpTimeSeriesChartMode;
}

export const HpTimeSeriesChart = (props: IHpTimeSeriesChartProps) => {
  const getStyle = ():React.CSSProperties => {
    if (_.isUndefined(props.mode))
      return { };
    switch (props.mode) {
      case  EnumHpTimeSeriesChartMode.Standalone:
        return { };
      case EnumHpTimeSeriesChartMode.SliderEmbedded:
        return {
          position: "absolute"
        }
    }
  }

  const displayAxis = (): boolean => {
    return (_.isUndefined(props.mode) || (props.mode == EnumHpTimeSeriesChartMode.Standalone));
  }

  const getXScale = () => {
    return d3.scaleTime()
      .domain([props.state.windowUnixFrom, props.state.windowUnixTo])
      .range([props.scss.paddingLeftPx, 
        props.scss.widthPx - props.scss.paddingLeftPx - props.scss.paddingRightPx]);
  };
  
  const getYScale = () => {
    return d3.scaleLinear()
      .domain([props.state.yMin, props.state.yMax])
      .range([props.scss.heightPx - props.scss.paddingTopPx - props.scss.paddingBottomPx, 
        props.scss.paddingTopPx]);
  };

  let chartTimeSeries: IChartTimeSeries[] = _.map(props.state.series, 
    ts => hpTimeSeriesChartCalculations.getTimeSeriesChartBuckets(ts,
                                                                  props.state.windowUnixFrom, 
                                                                  props.state.windowUnixTo,
                                                                  props.scss.widthPx));
  let xScale = getXScale();
  let yScale = getYScale();
  return (
    <svg 
      style={getStyle()}
      width={props.scss.widthPx} 
      height={props.scss.heightPx}>
      <TimeSeries 
        xScale={xScale} 
        yScale={yScale}
        chartTimeSeries={chartTimeSeries}
      />
      {displayAxis() && <DateTimeAxis xScale={xScale} scss={props.scss} />}
      {displayAxis() && <ValueAxis yScale={yScale} scss={props.scss} />}
    </svg>
  );
  
}