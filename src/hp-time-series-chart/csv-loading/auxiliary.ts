import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { handleActions, Action } from 'redux-actions';
import { hpTimeSeriesChartCalculations } from '../calculations';
import { IEventChartConfiguration } from '../interfaces';
import { csvLoadingCalculations as csvCalculations } from './calculations';
import { ICsvDataLoadedContext } from './models';
import { IHpTimeSeriesChartState } from '../state/index';
import { IDateTimePoint } from '../state/date-time-point';
import { ITimeSeries } from '../state/time-series';

export const csvLoadingAuxiliary = {
  /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  receivedCsvDataChunk: (state: IHpTimeSeriesChartState, csvRows: Array<any>): [IHpTimeSeriesChartState, ITimeSeries] => {
    let points: Array<IDateTimePoint> = csvCalculations.extractDateTimePoints(csvRows);
    
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      points: state.series.length == 0 ? points :  _.concat(state.series[0].points, points),
      from: state.series.length == 0 ? new Date(points[0].date.getTime()) : state.series[0].from,
      to: new Date(points[points.length-1].date.getTime())
    }

    timeSeries.unixToIndexMap = hpTimeSeriesChartCalculations.createUnixToIndexMap(timeSeries.points);

    let chartState = _.extend({}, state, <IHpTimeSeriesChartState> {
      chartMarkerConfiguration: <IEventChartConfiguration> {
        fillColor: "red",
        heightPx: 2
      },
      series: [timeSeries]
    });

    chartState.dateRangeDateFrom = new Date(timeSeries.from.getTime()); //_.min(_.map(chartState.series, el => el.from));
    chartState.dateRangeDateTo = new Date(timeSeries.to.getTime()); //_.max(_.map(chartState.series, el => el.to));
    chartState.windowDateFrom = new Date(timeSeries.from.getTime());// new Date(chartState.dateRangeDateFrom.getTime()),
    chartState.windowDateTo = new Date(timeSeries.to.getTime()); //new Date(chartState.dateRangeDateTo.getTime()) 
    chartState.yMin = _.min(_.concat([0], _.map(timeSeries.points, el => el.value)));
    chartState.yMax = _.max(_.map(timeSeries.points, el => el.value))

    return [chartState, timeSeries];
  },
  
  /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  csvDataLoaded: (state: IHpTimeSeriesChartState, csvRows: Array<any>): [IHpTimeSeriesChartState, ITimeSeries] => {
    let points: Array<IDateTimePoint> = csvCalculations.extractDateTimePoints(csvRows);
    if (points.length <= 1)
      return [state, null];
    
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      points: points,
      from: new Date(points[0].date.getTime()),
      to: new Date(points[points.length-1].date.getTime()),
      unixToIndexMap: hpTimeSeriesChartCalculations.createUnixToIndexMap(points)
    }

    let chartState = _.extend({}, state, <IHpTimeSeriesChartState> {
      chartMarkerConfiguration: <IEventChartConfiguration> {
        fillColor: "red",
        heightPx: 2
      },
      series: [timeSeries]
    });

    chartState.dateRangeDateFrom = _.min(_.map(chartState.series, el => el.from));
    chartState.dateRangeDateTo = _.max(_.map(chartState.series, el => el.to));
    chartState.windowDateFrom = new Date(chartState.dateRangeDateFrom.getTime()),
    chartState.windowDateTo = new Date(chartState.dateRangeDateTo.getTime()) 
    chartState.yMin = _.min(_.concat([0], _.map(timeSeries.points, el => el.value)));
    chartState.yMax = _.max(_.map(timeSeries.points, el => el.value))

    return [chartState, timeSeries];
  }
}