import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { handleActions, Action } from 'redux-actions';
import { hpTimeSeriesChartCalculations as chartCalculations } from '../calculations';
import { IEventChartConfiguration } from '../interfaces';
import { calculations as csvCalculations } from './calculations';
import { ICsvDataLoadedContext } from './models';
import { IHpTimeSeriesChartState } from '../state/index';
import { IDateTimePoint } from '../state/date-time-point';
import { ITimeSeries } from '../state/time-series';
import { EnumChartPointsSelectionMode } from '../state/enums';

export const csvLoadingAuxiliary = {
  /**
   * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
   */
  csvDataLoaded: (state: IHpTimeSeriesChartState, context: ICsvDataLoadedContext): [IHpTimeSeriesChartState, ITimeSeries] => {
    let points: Array<IDateTimePoint> = csvCalculations.extractDateTimePoints(context);
    if (points.length <= 1)
      return [state, null];
    let timeSeries: ITimeSeries = <ITimeSeries>{
      color: "steelblue",
      name: `csv_loaded_series_${state.series.length+1}`,
      applyResampling: true,
      points: points,
      from: new Date(points[0].date.getTime()),
      to: new Date(points[points.length-1].date.getTime()),
      rFactorSampleCache: chartCalculations.createResampledPointsCache(points),
      secondsPerSample: csvCalculations.estimateSecondsPerSample(points),
      yMinValue: _.min(_.map(points, el => el.value)),
      yMaxValue: _.max(_.map(points, el => el.value)),
    }  

    let chartState = _.extend({}, state, <IHpTimeSeriesChartState> {
      graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
      chartMarkerConfiguration: <IEventChartConfiguration> {
        fillColor: "red",
        heightPx: 2
      },
      series: [timeSeries]
    });

    chartState.dateRangeDateFrom = _.min(_.map(chartState.series, el => el.from));
    chartState.dateRangeDateTo = _.max(_.map(chartState.series, el => el.to));
    chartState.yMinValue = _.min(_.map(chartState.series, el => el.yMinValue));
    chartState.yMaxValue = _.min(_.map(chartState.series, el => el.yMaxValue));
    chartState.windowDateFrom = new Date(chartState.dateRangeDateFrom.getTime()),
    chartState.windowDateTo = new Date(chartState.dateRangeDateTo.getTime()) 

    return [chartState, timeSeries];
  }
}