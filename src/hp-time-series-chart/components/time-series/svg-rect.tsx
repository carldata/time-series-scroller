import React from "react";
import { ITimeSeriesRendererContext } from ".";

export interface ISvgRectProps {
  ctx: ITimeSeriesRendererContext;  
  date: Date;
  y: number;
} 

export const SvgRect = (props: ISvgRectProps) => 
  ((props.y !== props.ctx.yMin) && <rect
    x={props.ctx.xScale(props.date)}
    y={props.ctx.yScale(props.y)}
    width={1} //setting to default bucket width size (1 pixel) 
    height={props.ctx.yScale(props.ctx.yMin) - props.ctx.yScale(props.y)}
    fill={props.ctx.ts.color} />);