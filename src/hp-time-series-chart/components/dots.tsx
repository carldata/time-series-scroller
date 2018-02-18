import { ITimeSeriesBucket } from '../calculations/interfaces';
import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IUnixTimePoint } from '../state/unix-time-point';
import { IChartTimeSeries } from '../interfaces';

export interface IDotsProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  /**
   * placeholder for D3 function that calculates y-scale
   */
  yScale: (value: number) => number;
  
  points: IUnixTimePoint[];
}

export interface IDotsState {
}

export class Dots extends React.Component<IDotsProps, IDotsState> {
  constructor(props) {
    super(props);
    this.state = {}
  }
  
  renderDots() {
    let rendered = [];
    _.each(this.props.points, p => {
      rendered.push((<circle cx={this.props.xScale(new Date(p.unix))} cy={this.props.yScale(p.value)} fill="red" r="1" />));
    });
    return rendered;
  }

  render() {
    return (<g>{this.renderDots()}</g>)
  }
}