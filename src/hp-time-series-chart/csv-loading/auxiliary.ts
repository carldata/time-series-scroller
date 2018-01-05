import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { handleActions, Action } from 'redux-actions';
import { hpTimeSeriesChartCalculations } from '../calculations';
import { csvLoadingCalculations as csvCalculations } from './calculations';
import { ICsvDataLoadedContext } from './models';
import { IHpTimeSeriesChartState } from '../state/index';
import { IDateTimePoint } from '../state/date-time-point';
import { ITimeSeries } from '../state/time-series';

export const csvLoadingAuxiliary = {
    /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  startedLoadingCsvData: (state: IHpTimeSeriesChartState): IHpTimeSeriesChartState => {
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      points: [],
      unixFrom: 0,
      unixTo: 100,
      unixToIndexMap: hpTimeSeriesChartCalculations.createUnixToIndexMap([])
    }

    let chartState = _.extend({}, state, <IHpTimeSeriesChartState> {
      series: [timeSeries]
    });

    return chartState;
  },
  /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  receivedCsvDataChunk: (state: IHpTimeSeriesChartState, appendRows: boolean, csvRows: Array<any>): [IHpTimeSeriesChartState, ITimeSeries] => {
    let points: Array<IDateTimePoint> = csvCalculations.extractDateTimePoints(csvRows);
    
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      points: appendRows ? 
        (state.series.length == 0 ? points :  _.concat(state.series[0].points, points)) :
        points,
      unixFrom: appendRows ? 
        (state.series.length == 0 ? _.first(points).unix : _.first(state.series).unixFrom) :
        _.first(points).unix,
      unixTo: _.last(points).unix
    }

    timeSeries.unixToIndexMap = hpTimeSeriesChartCalculations.createUnixToIndexMap(timeSeries.points);

    let chartState = _.extend({}, state, <IHpTimeSeriesChartState> {
      series: [timeSeries]
    });

    chartState.dateRangeUnixFrom = timeSeries.unixFrom;
    chartState.dateRangeUnixTo = timeSeries.unixTo;
    chartState.windowUnixFrom = timeSeries.unixFrom;
    chartState.windowUnixTo = timeSeries.unixTo;
    chartState.yMin = _.min(_.concat([0], _.map(timeSeries.points, el => el.value)));
    chartState.yMax = _.max(_.map(timeSeries.points, el => el.value));

    return [chartState, timeSeries];
  }
}