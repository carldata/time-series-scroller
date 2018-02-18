import { ITimeSeriesBucket } from '../calculations/interfaces';
import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IUnixTimePoint } from '../state/unix-time-point';
import { IChartTimeSeries } from '../interfaces';

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
}

export interface ITimeSeriesState {
}

interface IAreaTimePoint {
  x: Date;
  y0: number;
  y1: number;
}

export class TimeSeries extends React.Component<ITimeSeriesProps, ITimeSeriesState> {
  constructor(props) {
    super(props);
    this.state = {}
  }

  private transformBucketsToAreaTimeSeries(buckets: ITimeSeriesBucket[]): IAreaTimePoint[] {
    let result: IAreaTimePoint[] = [];
    _.each(buckets, (b: ITimeSeriesBucket) => {
      switch (b.numberOfSamples) {
        case 1:
          result.push({ x: b.date, y0: b.minY, y1: b.minY });
          break;
        case 2:
          result.push({ x: new Date(b.unixFrom), y0: b.leftboundY, y1: b.leftboundY });
          result.push({ x: new Date(b.unixTo), y0: b.rightboundY, y1: b.rightboundY });
          break;
        default:
          result.push({ x: new Date(b.unixFrom), y0: b.leftboundY, y1: b.leftboundY });
          result.push({ x: b.date, y0: b.minY, y1: b.maxY });
          result.push({ x: new Date(b.unixTo), y0: b.rightboundY, y1: b.rightboundY });
      }
    });
    return result;
  }
  
  private getSvgPath(chartTimeSeries: IChartTimeSeries): string {
    let self = this;

    let line = d3.line()
      .x(function(d: ITimeSeriesBucket) { 
        return self.props.xScale(d.date); 
      })
      .y(function(d: ITimeSeriesBucket) { 
        return self.props.yScale(d.minY); 
      });

    return line(chartTimeSeries.buckets);
  }

  private getSvgAreaPath(ts: IChartTimeSeries): string {
    let self = this;

    let area = d3.area()
      .x(function(d: IAreaTimePoint) { 
        return self.props.xScale(d.x); 
      })
      .y0(function(d: IAreaTimePoint) { return self.props.yScale(d.y0); })
      .y1(function(d: IAreaTimePoint) { return self.props.yScale(d.y1); });

    let buckets = _.concat(_.isObject(ts.buckets.shadowPreceding) ? [ts.buckets.shadowPreceding] : [], 
                           ts.buckets.buckets,
                           _.isObject(ts.buckets.shadowSucceeding) ? [ts.buckets.shadowSucceeding] : []);

    return area(this.transformBucketsToAreaTimeSeries(buckets));
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