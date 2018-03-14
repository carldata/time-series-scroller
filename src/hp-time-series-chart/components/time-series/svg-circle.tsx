import * as React from "react";
import { IOnScreenTimeSeries } from "../../state/time-series";
import { ITimeSeriesBucket } from "../../calculations/interfaces";
import { ITimeSeriesRendererContext } from ".";

export interface ISvgCircleProps {
  ctx: ITimeSeriesRendererContext;  
  date: Date;
  y: number;
} 

export class SvgCircle extends React.Component<ISvgCircleProps> {
  render() {
    return <circle
      cx={this.props.ctx.xScale(this.props.date)} 
      cy={this.props.ctx.yScale(this.props.y)} 
      fill={this.props.ctx.ts.color} 
      r={2} />
  }
}