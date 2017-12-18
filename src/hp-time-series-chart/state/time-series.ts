import { IChartZoomSettings } from './chart-zoom-settings';
import { IDateTimePoint } from './date-time-point';

/**
 * Describes a data series as loaded from CSV / database / web service
 */
export interface ITimeSeries {
  name: string;
  /**
   * The color time series will be drawn with
   */
  color: string;
  points: IDateTimePoint[];

  /**
   * Equivalent of points[0].time
   */
  from: Date;

  /**
   * Equivalent of points[points.length-1].time
   */
  to: Date;
}