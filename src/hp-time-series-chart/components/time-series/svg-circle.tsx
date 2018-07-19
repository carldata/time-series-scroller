import React from "react";
import { ITimeSeriesRendererContext } from ".";

export interface ISvgCircleProps {
  ctx: ITimeSeriesRendererContext;  
  date: Date;
  y: number;
} 

export const SvgCircle = (props: ISvgCircleProps) =>
  <circle
    cx={props.ctx.xScale(props.date)} 
    cy={props.ctx.yScale(props.y)} 
    fill={props.ctx.ts.color} 
    r={2} />;