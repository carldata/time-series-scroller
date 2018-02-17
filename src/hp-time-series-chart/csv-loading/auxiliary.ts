import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { handleActions, Action } from 'redux-actions';
import { hpTimeSeriesChartCalculations } from '../calculations';
import { csvLoadingCalculations as csvCalculations, EnumRawCsvFormat, IExtractUnixTimePointsConfig } from './calculations';
import { IHpTimeSeriesChartState } from '../state/index';
import { IUnixTimePoint } from '../state/unix-time-point';
import { ITimeSeries } from '../state/time-series';
import { isExtraneousPopstateEvent } from 'history/DOMUtils';

export const csvLoadingAuxiliary = {
    /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  startedLoadingCsvData: (state: IHpTimeSeriesChartState): IHpTimeSeriesChartState => {
    return _.extend({}, state, <IHpTimeSeriesChartState> {
      series: []
    });
  },
  /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  receivedCsvDataChunk: (state: IHpTimeSeriesChartState, appendRows: boolean, csvRows: Array<any>, csvExtractConfig: IExtractUnixTimePointsConfig): [IHpTimeSeriesChartState, ITimeSeries] => {
    if (csvRows.length == 0)
      return [state, state.series.length > 0 ? _.first(state.series) : null];
    let points: Array<IUnixTimePoint> = csvCalculations.extractUnixTimePoints(csvRows, csvExtractConfig);
    
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      points: appendRows ? 
        (state.series.length == 0 ? points :  _.concat(_.first(state.series).points, points)) :
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
    chartState.yMin = _.min( _.map(timeSeries.points, el => el.value));
    chartState.yMax = _.max(_.map(timeSeries.points, el => el.value));

    return [chartState, timeSeries];
  }
}