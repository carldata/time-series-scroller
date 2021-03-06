import { IUnixTimePoint } from './unix-time-point'
import { IHpTimeSeriesChartTimeSeries } from './time-series';
import { IUnixTimeRangeSelection } from './unix-time-range-selection';

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

  /**
   * Series as displayed in component.
   * Currently there is support for only one !
   */
  series: IHpTimeSeriesChartTimeSeries[];

  rangeSelections: IUnixTimeRangeSelection[];
};