import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IChartDimensions } from '../interfaces';

export interface IValueAxisProps {
  chartDimensions: IChartDimensions;  
  /**
   * placeholder for D3 function that calculates x-scale
   */
  yScale: (value: any) => any;
}

export const ValueAxis = (props: IValueAxisProps) => {
  let getAxisTransform = ():string =>  {
    return `translate(${props.chartDimensions.paddingLeftPx}, 0)`;
  }

  return (
    <g 
      className="axis"
      transform={getAxisTransform()}
      ref={(c) => {
        if (!_.isObject(c))
          return;
        var axisLeft = d3.axisLeft(props.yScale);
        let d3SelectionResult = d3.select(c);
        d3SelectionResult.call(axisLeft);
      }} >
    </g>);
}