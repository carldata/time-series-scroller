import { Moment } from 'moment';
import { IDateTimePoint } from './dateTimePoint';
import { ITimeSeries } from './timeSeries';
import { IDateTimePointSeriesCache } from './dateTimePointSeriesCache';
import { EnumChartPointsSelectionMode } from './enums';
import { IChartZoomSettings } from './chartZoomSettings';
import { IEventChartConfiguration } from '../common/interfaces';

export interface IChartState {
  isDataLoading: boolean;
  /**
   * In the scrolling chart - the moment of time user sees on X-axis coordinate equal 0
   */
  windowDateFrom: Moment,
  /**
   * In the scrolling chart - the moment of time user sees on X-axis coordinate equal to max/full canvas width
   */
  windowDateTo: Moment,

  /**
   * The minimal date we can find in all the series of chart
   */
  dateRangeDateFrom: Moment;
  /**
   * The maximal date we can find in all the series of chart
   */
  dateRangeDateTo: Moment;

  /**
   * Minimum y-value we can find in all the series of chart
   */
  yMinValue: number;
  /**
   * Maximum y-value we can find in all the series of chart
   */
  yMaxValue: number;

  graphPointsSelectionMode: EnumChartPointsSelectionMode;
  chartZoomSettings: IChartZoomSettings;
  series: ITimeSeries[];
  chartMarkerConfiguration?: IEventChartConfiguration;
};