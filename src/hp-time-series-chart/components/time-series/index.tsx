import * as _ from 'lodash';
import * as React from 'react';
import { IOnScreenTimeSeries } from '../../state/time-series';
import { ITimeSeriesBucket } from '../../calculations/interfaces';
import { EnumTimeSeriesType } from '../../state/enums';
import { renderLineTimeSeries } from './line-time-series';
import { renderDotTimeSeries, EnumDotRenderStrategy } from './dot-time-series';
import { renderBarTimeSeries } from './bar-time-series';

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
  yMin: number;
  yMax: number;
}

export interface ITimeSeriesRendererContext {
  ts: IOnScreenTimeSeries;
  xScale: (value: any) => any;
  yScale: (value: number) => number;
  yMin: number;
  yMax: number;
}

export class TimeSeries extends React.Component<ITimeSeriesProps> {
  constructor(props) {
    super(props);
  }

  renderSvgPrimitives() {
    let result = [];
    _.each(this.props.chartTimeSeries, ts => {
      let ctx: ITimeSeriesRendererContext = {
        ts: ts,
        xScale: this.props.xScale,
        yScale: this.props.yScale,
        yMin: this.props.yMin,
        yMax: this.props.yMax,
      };
      switch (ts.type) {
        case EnumTimeSeriesType.Line:
          result.push(renderLineTimeSeries(ctx));
          break;
        case EnumTimeSeriesType.Dots:
          result.push(renderDotTimeSeries(ctx, EnumDotRenderStrategy.ShowAll));
          break;
        case EnumTimeSeriesType.DottedLine:
          result.push(renderLineTimeSeries(ctx));
          result.push(renderDotTimeSeries(ctx, EnumDotRenderStrategy.ShowDataSourceProximityFiltered));
          break;
        case EnumTimeSeriesType.Bars:
          result.push(renderBarTimeSeries(ctx));
          break;
      }
    })
    return result;
  }

  render() {
    return (<g>{this.renderSvgPrimitives()}</g>)
  }
}