import { ITimeSeriesBucket } from '../calculations/interfaces';
import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { IUnixTimePoint } from '../state/unix-time-point';
import { IOnScreenTimeSeries } from '../state/time-series';
import { EnumTimeSeriesType } from '../state/enums';

export interface ITimeSeriesProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  /**
   * placeholder for D3 function that calculates y-scale
   */
  yScale: (value: number) => number;
  
  chartTimeSeries: IOnScreenTimeSeries[];
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

  private getSvgAreaPath(ts: IOnScreenTimeSeries): string {
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

  renderSvgArea = (ts: IOnScreenTimeSeries): JSX.Element =>
    (<path 
      key={ts.name} 
      d={this.getSvgAreaPath(ts)} 
      fill={ts.color} 
      stroke={ts.color} />);
  
  getCircleKey = (ts: IOnScreenTimeSeries, b: ITimeSeriesBucket, unix: number, y: number) => 
    `${ts.name}|${b.unixFrom}|${b.unixTo}|${unix}|${y}`

  getCircleRadius = (b: ITimeSeriesBucket) => {
    return 2;
  }
  
  renderSvgCircles = (ts: IOnScreenTimeSeries): JSX.Element[] => {
    let result = [];
    let bucketsToDisplay = _.filter(ts.buckets.buckets, (b: ITimeSeriesBucket) => 
      _.isNumber(b.minY) && _.isNumber(b.maxY) && _.isNumber(b.leftboundY) && _.isNumber(b.rightboundY));
    for (let b of bucketsToDisplay) {
      let unixAvg = b.unixFrom+(b.unixTo-b.unixFrom)/2;
      if (b.numberOfSamples == 1) {
        result.push(<circle 
          key={this.getCircleKey(ts, b, unixAvg, b.maxY)} 
          cx={this.props.xScale(new Date(unixAvg))} 
          cy={this.props.yScale(b.maxY)} 
          fill={ts.color} 
          r={this.getCircleRadius(b)} />);
      }
      if (b.numberOfSamples >= 2) {
        result.push(<circle 
          key={this.getCircleKey(ts, b, b.unixFrom, b.leftboundY)} 
          cx={this.props.xScale(b.unixFrom)} 
          cy={this.props.yScale(b.leftboundY)} 
          fill={ts.color} 
          r={this.getCircleRadius(b)} />);
        if (b.rightboundY != b.leftboundY)
          result.push(<circle 
            key={this.getCircleKey(ts, b, b.unixTo, b.rightboundY)} 
            cx={this.props.xScale(b.unixTo)} 
            cy={this.props.yScale(b.rightboundY)} 
            fill={ts.color} 
            r={this.getCircleRadius(b)} />);
      }
      if (b.numberOfSamples > 2) {
        result.push(<circle 
          key={this.getCircleKey(ts, b, unixAvg, b.minY)} 
          cx={this.props.xScale(unixAvg)} 
          cy={this.props.yScale(b.minY)} 
          fill={ts.color} 
          r={this.getCircleRadius(b)} />);
        if (b.maxY != b.minY) 
          result.push(<circle 
            key={this.getCircleKey(ts, b, unixAvg, b.maxY)} 
            cx={this.props.xScale(unixAvg)} 
            cy={this.props.yScale(b.maxY)} 
            fill={ts.color} 
            r={this.getCircleRadius(b)} />);
      }
    }
    return result;
  }

  renderSvgPrimitives() {
    let result = [];
    _.each(this.props.chartTimeSeries, ts => {
      switch (ts.type) {
        case EnumTimeSeriesType.Line:
          result.push(this.renderSvgArea(ts));
          break;
        case EnumTimeSeriesType.Dots:
          result = _.concat(result, this.renderSvgCircles(ts));
          break;
      }
    })
    return result;
  }

  render() {
    return (<g>{this.renderSvgPrimitives()}</g>)
  }
}