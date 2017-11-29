import * as React from 'react';
import * as _ from 'lodash';
import { DateTimeAxis } from './dateTimeAxis';
import { IChartDimensions, IEventChartConfiguration } from '../common/interfaces';
import { IDateTimePoint } from '../models/dateTimePoint';

export interface IEventsProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  data: IDateTimePoint[];
  chartDimensions: IChartDimensions;
  eventChartConfiguration?: IEventChartConfiguration;
} 

export const Events = (props: IEventsProps) => {
  if (!_.isObject(props.eventChartConfiguration))
    return null;
  let result: JSX.Element[] = [];
  let rectStyle: React.CSSProperties = {
    fill: `${props.eventChartConfiguration.fillColor}`
  }
  _.each(props.data, el => {
    if (el.event) {
      result.push(<rect
        key={el.unix} 
        x={props.xScale(el.date)} 
        y={props.chartDimensions.canvasHeight-props.eventChartConfiguration.heightPx}
        width={1}
        height={props.eventChartConfiguration.heightPx}
        style={rectStyle}
      />);
    }
  });
  return (<g>{result}</g>);
}