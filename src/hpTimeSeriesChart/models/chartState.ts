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
  windowDateFrom: Date,
  /**
   * In the scrolling chart - the moment of time user sees on X-axis coordinate equal to max/full canvas width
   */
  windowDateTo: Date,

  /**
   * The minimal date we can find in all the series of chart
   */
  dateRangeDateFrom: Date;
  /**
   * The maximal date we can find in all the series of chart
   */
  dateRangeDateTo: Date;

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