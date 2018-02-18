import { IUnixTimePoint } from './unix-time-point'
import { ITimeSeries } from './time-series';
import { IChartZoomSettings } from './chart-zoom-settings';

export interface IHpTimeSeriesChartState {
  /**
   * In the scrolling chart - the moment of time user sees on X-axis coordinate equal 0
   */
  windowUnixFrom: number,
  /**
   * In the scrolling chart - the moment of time user sees on X-axis coordinate equal to max/full canvas width
   */
  windowUnixTo: number,

  /**
   * The minimal date we can find in all the series of chart
   */
  dateRangeUnixFrom: number;
  /**
   * The maximal date we can find in all the series of chart
   */
  dateRangeUnixTo: number;

  /**
   * Minimum y-value we can find in all the series of chart
   */
  yMin: number;
  /**
   * Maximum y-value we can find in all the series of chart
   */
  yMax: number;

  chartZoomSettings: IChartZoomSettings;

  /**
   * Series as displayed in component.
   * Currently there is support for only one !
   */
  series: ITimeSeries[];
};