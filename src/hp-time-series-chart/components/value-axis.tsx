import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IHpTimeSeriesChartScss } from '../../sass/styles';

export interface IValueAxisProps {
  scss: IHpTimeSeriesChartScss;  
  /**
   * placeholder for D3 function that calculates x-scale
   */
  yScale: (value: any) => any;
}

export const ValueAxis = (props: IValueAxisProps) => {
  let getAxisTransform = ():string =>  {
    return `translate(${props.scss.paddingLeftPx}, 0)`;
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