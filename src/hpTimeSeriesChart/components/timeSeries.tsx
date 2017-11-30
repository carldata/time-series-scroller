import * as React from 'react';
import * as _ from 'lodash';
import * as d3 from 'd3';
import { TimeSeriesPointInTime } from './timeSeriesPointInTime';
import { EnumChartPointsSelectionMode } from '../state/enums';
import { IDateTimePoint } from '../state/dateTimePoint';
import { IChartDimensions, IEventChartConfiguration, IChartTimeSeries } from '../common/interfaces';

export interface ITimeSeriesProps {
  /**
   * placeholder for D3 function that calculates x-scale
   */
  xScale: (value: any) => any;
  /**
   * placeholder for D3 function that calculates y-scale
   */
  yScale: (value: number) => number;
  
  graphPointsSelectionMode: EnumChartPointsSelectionMode;
  chartTimeSeries: IChartTimeSeries[];
  chartDimensions: IChartDimensions;
}

export interface ITextGauge {
  visible: boolean;
  textValue: string;
  x: number;
  y: number;
}

export interface ITimeSeriesState {
  // selecting points not supported for now !
  // selectedPoints: Array<IDateTimePoint>;
  draggedPointTextGauge: ITextGauge;
}

export class TimeSeries extends React.Component<ITimeSeriesProps, ITimeSeriesState> {
  constructor(props) {
    super(props);
    this.state = {
      // selecting points not supported for now !
      // selectedPoints: [], 
      draggedPointTextGauge: {
        visible: false,
        textValue: "",
        x: 0,
        y: 0
      }
    }
  }
  
  getSvgPath(chartTimeSeries: IChartTimeSeries): string {
    var self = this;

    var line = d3.line()
      .x(function(d: IDateTimePoint) { 
        return self.props.xScale(d.date); 
      })
      .y(function(d: IDateTimePoint) { return self.props.yScale(d.value); });

    return line(chartTimeSeries.points);
  }

  getSvgAreaPath(chartTimeSeries: IChartTimeSeries): string {
    var self = this;

    var area = d3.area()
      .x(function(d: IDateTimePoint) { 
        return self.props.xScale(d.date); 
      })
      .y0(function(d: IDateTimePoint) { return self.props.yScale(d.envelopeValueMin); })
      .y1(function(d: IDateTimePoint) { return self.props.yScale(d.envelopeValueMax); });

    return area(chartTimeSeries.points);
  }

  getCircleRadiusBasedOnHorizontalSampleDistancePx = (horizontalSampleDistancePx: number) => {
    if (horizontalSampleDistancePx < 3)
      return 1;
    if ((horizontalSampleDistancePx >= 3) && (horizontalSampleDistancePx < 6))
      return 2;
    if ((horizontalSampleDistancePx >= 6) && (horizontalSampleDistancePx < 8))
      return 3;
    if ((horizontalSampleDistancePx >= 8) && (horizontalSampleDistancePx < 11))
      return 4;
    if ((horizontalSampleDistancePx >= 11) && (horizontalSampleDistancePx < 14))
      return 5;
    if ((horizontalSampleDistancePx >= 14) && (horizontalSampleDistancePx < 20))
      return 6;
    return 8;
  }

  // selecting points not supported for now !
  // elementMarkedByUnixTimeStapmIsOnSelectedList(unix: number): boolean {
  //   return (_.findIndex(this.state.selectedPoints, (el) => el.unix == unix) >= 0);
  // }

  renderTimeSeriesPointInTimeReactElement(chartTimeSeries: IChartTimeSeries, point: IDateTimePoint, isSelected: boolean) {
    return <TimeSeriesPointInTime
      key={point.unix} 
      cx={this.props.xScale(point.date)}
      cy={this.props.yScale(point.value)}
      unix={point.unix}
      fill={isSelected ? "red" : "orange"}
      isSelected={isSelected}
      r={this.getCircleRadiusBasedOnHorizontalSampleDistancePx(chartTimeSeries.horizontalSampleDistancePx)}
      selectionActiveAreaHeightPx={150}
      startedDragging={() => { 
        this.setState({
          // selecting points not supported for now !
          //selectedPoints: this.state.selectedPoints,
          draggedPointTextGauge: { textValue: "", x: 0, y: 0, visible: true }
        })
      }}
      beingDragged={(x: number, y: number, value: string) => {
        var prevState = this.state;
        prevState.draggedPointTextGauge.textValue = value;
        prevState.draggedPointTextGauge.x = this.props.xScale(point.date);
        prevState.draggedPointTextGauge.y = y-this.getCircleRadiusBasedOnHorizontalSampleDistancePx(chartTimeSeries.horizontalSampleDistancePx)-1;
        this.setState(prevState);
      }}
      stoppedDragging={() => {
        this.setState({
          // selecting points not supported for now !
          //selectedPoints: this.state.selectedPoints,
          draggedPointTextGauge: { textValue: "", x: 0, y: 0, visible: false }
        });
      }}
      toggleSelected={(unix) => {
      }}
      graphPointsSelectionMode={this.props.graphPointsSelectionMode}
    />
  }

  renderPoints = (chartTimeSeries: IChartTimeSeries) => {
    var result = [];
    switch (this.props.graphPointsSelectionMode) {
      case EnumChartPointsSelectionMode.SelectMultiple:
      case EnumChartPointsSelectionMode.SelectUnselectSingle:
      case EnumChartPointsSelectionMode.UnselectMultiple:
      if (chartTimeSeries.horizontalSampleDistancePx >= 6) {
        result = _.map(chartTimeSeries.points, (el) => {
          // selecting points not supported for now !
          // var isSelected = _.findIndex(this.state.selectedPoints, (selectedPoint) => selectedPoint.unix == el.unix) >= 0;
          // return this.renderTimeSeriesPointInTimeReactElement(el, isSelected);
        });
      }
      else {
        // selecting points not supported for now !
        // result = _.map(this.state.selectedPoints, (el) => {
        //   return this.renderTimeSeriesPointInTimeReactElement(el, true);
        // });
      }
    }
    return result;
  }

  renderTimeSeries = () => {
    let result = [];
     _.each(this.props.chartTimeSeries, el => {
      if (el.rFactor <= 1)
        result.push(<path key={el.name} d={this.getSvgPath(el)} fill="none" stroke={el.color} />);
      if (el.rFactor > 1)
        result.push(<path key={el.name} d={this.getSvgAreaPath(el)} fill={el.color} stroke={el.color} />);
      result.push(this.renderPoints(el));
    });
    return result;
  }

  /**
   * Keep in mind render() method differentiates between rendering series provided
   * 1) for rFactor - resample factor - equal or less to 1,
   * 2) for rFactor - larger than 1.
   * 
   * So two cases:
   * 1) For resample factor equal to 1, for a real pixel P=(X,Y) (representing time series on screen), 
   *    there is exactly one data point in the time series (props.series) to be represented.
   * 2) Resample factor equal to N > 1 (greater than 1) means that for one pixel P=(X,Y) - and more precisely - 
   *    one pixel X value on screen, there are possibly N points in data series to be represented 
   *    (in X value on screen).
   * 
   * But... in fact the concept of "one pixel" is misleading in case 2), in reality there should be a solid vertical 1px wide 
   * line drawn between two pixels PLow = (X, Y0) and PHigh = (X, Y1) (creating an envelope).
   * We don't draw a SVG line here, but the SVG "area" chart construct with a fill color fits exactly into what we need in this case.
   */
  render() {
    return (<g>
      {this.state.draggedPointTextGauge.visible && 
       <text 
        x={this.state.draggedPointTextGauge.x} 
        y={this.state.draggedPointTextGauge.y}>
        {this.state.draggedPointTextGauge.textValue}
      </text>}
      {this.renderTimeSeries()}      
    </g>);
  }
}