import * as dateFns from 'date-fns';
import * as React from 'react';
import * as d3 from 'd3';
import * as _ from 'lodash';
import { Dots } from './components/dots';
import { hpTimeSeriesChartCalculations } from './calculations';
import { IUnixTimePoint } from './state/unix-time-point';
import { TimeSeries } from './components/time-series';
import { DateTimeAxis } from './components/date-time-axis';
import { ValueAxis } from './components/value-axis';
import { IHpTimeSeriesChartScss } from '../sass/styles';
import { IHpTimeSeriesChartState } from './state';
import { IOnScreenTimeSeries, IHpTimeSeriesChartTimeSeries } from './state/time-series';
import { IInteractions } from './interactions';

export enum EnumHpTimeSeriesChartMode {
  Standalone,
  SliderEmbedded
}

export interface IHpTimeSeriesChartBaseProps {
  state: IHpTimeSeriesChartState;
  scss: IHpTimeSeriesChartScss;
  interactions?: IInteractions;
  mode?: EnumHpTimeSeriesChartMode;
  parentCallback?: (svg: HTMLElement) => void;
}

export const HpTimeSeriesChartBase = (props: IHpTimeSeriesChartBaseProps) => {
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

  /**
   * converts x (on screen) coordinate to unix date-time
   */
  const convertXToUnix = (x: number): number => {
    return props.state.windowUnixFrom + (x - props.scss.paddingLeftPx)/ 
      (props.scss.widthPx - props.scss.paddingLeftPx - props.scss.paddingRightPx)*
      (props.state.windowUnixTo - props.state.windowUnixFrom);
  }

  const getXScale = () => 
    d3.scaleTime()
      .domain([props.state.windowUnixFrom, props.state.windowUnixTo])
      .range([props.scss.paddingLeftPx, props.scss.widthPx - props.scss.paddingRightPx]);

  const getYScale = () => {
    return d3.scaleLinear()
      .domain([props.state.yMin, props.state.yMax])
      .range([props.scss.heightPx - props.scss.paddingTopPx - props.scss.paddingBottomPx, 
        props.scss.paddingTopPx]);
  };

  let xScale = getXScale();
  let yScale = getYScale();

  return (
    <svg 
      style={getStyle()}
      ref={(svg) => {
        if (_.isObject(svg)) {
          if (_.isFunction(props.parentCallback))
            props.parentCallback(svg);
          if (_.isObject(props.interactions)) {
            if (_.isFunction(props.interactions.mouseButtonDown))
              svg.onmousedown = (ev) => props.interactions.mouseButtonDown(convertXToUnix(ev.offsetX));
            if (_.isFunction(props.interactions.mouseButtonUp))
              svg.onmouseup = (ev) => props.interactions.mouseButtonUp(convertXToUnix(ev.offsetX));
          }
        }
      }}
      width={props.scss.widthPx} 
      height={props.scss.heightPx}>
      <TimeSeries 
        xScale={xScale} 
        yScale={yScale}
        chartTimeSeries={hpTimeSeriesChartCalculations.convertToOnScreenTimeSeries(props.state.series,
                                                                                   props.state.windowUnixFrom,
                                                                                   props.state.windowUnixTo,
                                                                                   props.scss.widthPx)}
      />
      {displayAxis() && <DateTimeAxis xScale={xScale} scss={props.scss} />}
      {displayAxis() && <ValueAxis yScale={yScale} scss={props.scss} />}
    </svg>
  );
}