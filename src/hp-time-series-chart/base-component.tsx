import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
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
import { IParentSizeFitParamaters } from '../hocs/with-fit-to-parent';

export enum EnumHpTimeSeriesChartMode {
  Standalone,
  SliderEmbedded
}

export interface IHpTimeSeriesChartBaseProps {
  state: IHpTimeSeriesChartState;
  scss: IHpTimeSeriesChartScss;
  interactions?: IInteractions;
  mode?: EnumHpTimeSeriesChartMode;
  /**
   * Optional parameter giving the ability to set custom D3 y-axis scale domain.
   * The domain in this case is just a pair of numbers indicating 
   * the maximum and minimum value.
   * 
   * If not set, the minimum/maximum value is the minimum/maximum float 
   * number found in all the series.
   */
  scaleLinearDomain?: (yMin: number, yMax: number) => { yMin: number, yMax: number };
  /**
   * Set formatting accordingly: https://github.com/d3/d3-time-format/blob/master/README.md#timeFormat
   */
  dateTimeAxisTickFormat?: string;
  refCallback?: (ref: any) => void;
}

export const HpTimeSeriesChartBase = (props: IHpTimeSeriesChartBaseProps) => {
  const { yMin, yMax } = _.isFunction(props.scaleLinearDomain) ? 
    (props.scaleLinearDomain(props.state.yMin, props.state.yMax)) :
    { yMin: props.state.yMin, yMax: props.state.yMax };

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

  const getYScale = () =>
    d3.scaleLinear()
      .domain([yMin, yMax])
      .range([props.scss.heightPx - props.scss.paddingTopPx - props.scss.paddingBottomPx, 
        props.scss.paddingTopPx]);

  let xScale = getXScale();
  let yScale = getYScale();

  return (
    <svg 
      style={getStyle()}
      ref={(svg) => {
        if (_.isObject(svg)) {
          if (_.isFunction(props.refCallback))
            props.refCallback(svg);
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
        yMin={yMin}
        yMax={yMax}
        chartTimeSeries={hpTimeSeriesChartCalculations.convertToOnScreenTimeSeries(props.state.series,
                                                                                   props.state.windowUnixFrom,
                                                                                   props.state.windowUnixTo,
                                                                                   props.scss.widthPx)}
      />
      {displayAxis() && <DateTimeAxis xScale={xScale} scss={props.scss} tickFormat={props.dateTimeAxisTickFormat} />}
      {displayAxis() && <ValueAxis yScale={yScale} scss={props.scss} />}
    </svg>
  );
}