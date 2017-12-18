import { IDateTimePoint } from './date-time-point';
import { ITimeSeries } from './time-series';
import { IChartZoomSettings } from './chart-zoom-settings';
import { IEventChartConfiguration } from '../interfaces';

export interface IHpTimeSeriesChartState {
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
  yMin: number;
  /**
   * Maximum y-value we can find in all the series of chart
   */
  yMax: number;

  chartZoomSettings: IChartZoomSettings;
  series: ITimeSeries[];
  chartMarkerConfiguration?: IEventChartConfiguration;
};