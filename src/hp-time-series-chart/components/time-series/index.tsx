import * as _ from 'lodash';
import * as React from 'react';
import { IOnScreenTimeSeries } from '../../state/time-series';
import { ITimeSeriesBucket } from '../../calculations/interfaces';
import { EnumTimeSeriesType } from '../../state/enums';
import { renderLineTimeSeries } from './line-time-series';
import { renderDotTimeSeries } from './dot-time-series';

export interface ITimeSeriesProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  /**
   * placeholder for D3 function that calculates y-scale
   */
  yScale: (value: number) => number;
  
  chartTimeSeries: IOnScreenTimeSeries[];
}

export interface ITimeSeriesState {
}

export interface ITimeSeriesRendererContext {
  ts: IOnScreenTimeSeries;
  xScale: (value: any) => any;
  yScale: (value: number) => number
}

export class TimeSeries extends React.Component<ITimeSeriesProps, ITimeSeriesState> {
  constructor(props) {
    super(props);
    this.state = {}
  }

  renderSvgPrimitives() {
    let result = [];
    _.each(this.props.chartTimeSeries, ts => {
      let ctx: ITimeSeriesRendererContext = {
        ts: ts,
        xScale: this.props.xScale,
        yScale: this.props.yScale
      }
      switch (ts.type) {
        case EnumTimeSeriesType.Line:
          result.push(renderLineTimeSeries(ctx));
          break;
        case EnumTimeSeriesType.Dots:
          result.push(renderDotTimeSeries(ctx));
          break;
        case EnumTimeSeriesType.DottedLine:
          result.push(renderLineTimeSeries(ctx));
          result.push(renderDotTimeSeries(ctx));
          break;
      }
    })
    return result;
  }

  render() {
    return (<g>{this.renderSvgPrimitives()}</g>)
  }
}