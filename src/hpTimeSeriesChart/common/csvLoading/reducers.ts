import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { handleActions, Action } from 'redux-actions';
import { IHpTimeSeriesChartState } from '../../state';
import { calculations as chartCalculations } from '../calculations';
import { EnumZoomSelected, EnumChartPointsSelectionMode } from '../../state/enums';
import { IEventChartConfiguration } from '../interfaces';
import { ITimeSeries } from '../../state/timeSeries';
import { IDateTimePoint } from '../../state/dateTimePoint';
import { calculations as csvCalculations } from './calculations';
import { ICsvDataLoadedActionResponse, EnumCsvFileSource } from './models';

export const csvDataLoadInitialize = (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
  let [dateRangeDateFrom, dateRangeDateTo] = action.payload;
  return _.extend({}, state, <IHpTimeSeriesChartState> {
    isDataLoading: true,
    dateRangeDateFrom: new Date(dateRangeDateFrom.getTime()),
    dateRangeDateTo: new Date(dateRangeDateTo.getTime()),
    windowDateFrom: new Date(dateRangeDateFrom.getTime()),
    windowDateTo: new Date(dateRangeDateTo.getTime())
  });
}

/**
 * Returns a new, updated IChartState and ITimeSeries that was created and added to IChartState
 */
export const csvDataLoadFinalize = (state: IHpTimeSeriesChartState, action: Action<ICsvDataLoadedActionResponse>): [IHpTimeSeriesChartState, ITimeSeries] => {
  let points: Array<IDateTimePoint> = csvCalculations.extractDateTimePointsOutOfCsvFileContents(action.payload);
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
    isDataLoading: false,
    graphPointsSelectionMode: EnumChartPointsSelectionMode.NoSelection,
    chartMarkerConfiguration: <IEventChartConfiguration> {
      fillColor: "red",
      heightPx: 2
    },
    series: _.concat(state.series, timeSeries)
  });

  chartState.dateRangeDateFrom = _.min(_.map(chartState.series, el => el.from));
  chartState.dateRangeDateTo = _.max(_.map(chartState.series, el => el.to));
  chartState.yMinValue = _.min(_.map(chartState.series, el => el.yMinValue));
  chartState.yMaxValue = _.min(_.map(chartState.series, el => el.yMaxValue));
  
  if (action.payload.config.source == EnumCsvFileSource.LocalFileSystem) {
    chartState.windowDateFrom = new Date(chartState.dateRangeDateFrom.getTime()),
    chartState.windowDateTo = new Date(chartState.dateRangeDateTo.getTime()) 
  }

  return [chartState, timeSeries];
}