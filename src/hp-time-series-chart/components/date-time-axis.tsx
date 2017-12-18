import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IChartDimensions } from '../interfaces';

export interface DateTimeAxisProps {
  chartDimensions: IChartDimensions;  
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
}

export const DateTimeAxis = (props: DateTimeAxisProps) => {
  let getAxisTransform = ():string =>  {
    return `translate(0, ${props.chartDimensions.canvasHeight - props.chartDimensions.timeSeriesChartPaddingBottom})`;
  }

  return (
    <g 
      className="axis"
      transform={getAxisTransform()}
      ref={(node) => {
        if (!_.isObject(node))
          return;
        var axisBottom = d3.axisBottom(props.xScale);
        let d3SelectionResult = d3.select(node);
        d3SelectionResult.call(axisBottom);
      }} >
    </g>);
}