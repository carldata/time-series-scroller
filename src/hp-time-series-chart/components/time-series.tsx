import { ITimeSeriesBucket } from '../calculations/interaces';
import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IDateTimePoint } from '../state/date-time-point';
import { IChartDimensions, IEventChartConfiguration, IChartTimeSeries } from '../interfaces';

export interface ITimeSeriesProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  /**
   * placeholder for D3 function that calculates y-scale
   */
  yScale: (value: number) => number;
  
  chartTimeSeries: IChartTimeSeries[];
  chartDimensions: IChartDimensions;
}

export interface ITimeSeriesState {
}

export class TimeSeries extends React.Component<ITimeSeriesProps, ITimeSeriesState> {
  constructor(props) {
    super(props);
    this.state = {}
  }
  
  getSvgPath(chartTimeSeries: IChartTimeSeries): string {
    var self = this;

    var line = d3.line()
      .x(function(d: ITimeSeriesBucket) { 
        return self.props.xScale(d.date); 
      })
      .y(function(d: ITimeSeriesBucket) { 
        return self.props.yScale(d.min); 
      });

    return line(chartTimeSeries.buckets);
  }

  getSvgAreaPath(ts: IChartTimeSeries): string {
    var self = this;

    var area = d3.area()
      .x(function(d: ITimeSeriesBucket) { 
        return self.props.xScale(d.date); 
      })
      .y0(function(d: ITimeSeriesBucket) { return self.props.yScale(d.min); })
      .y1(function(d: ITimeSeriesBucket) { return self.props.yScale(d.max); });
    
    let buckets = _.concat(_.isObject(ts.precedingBucket) ? [ts.precedingBucket] : [], 
                           ts.buckets,
                           _.isObject(ts.succeedingBucket) ? [ts.succeedingBucket] : []);
    return area(buckets);
  }

  renderPaths() {
    return _.map(this.props.chartTimeSeries, ts =>
      (<path 
        key={ts.name} 
        d={this.getSvgAreaPath(ts)} 
        fill={ts.color} 
        stroke={ts.color} />)
    );
  }

  render() {
    return (<g>{this.renderPaths()}</g>)
  }
}