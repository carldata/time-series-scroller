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
   * Map introduced for optimization allowing us quckly find index of the 
   * first sample in points array for a given "bucket from" unix timestamp -
   * this is bucketing over raw data to: 1) make "filter" operation much faster
   * 2) avoid creation of filtered array of the raw data. 
   */
  unixToIndexMap: Map<number, number>;  

  /**
   * Equivalent of points[0].time
   */
  from: Date;

  /**
   * Equivalent of points[points.length-1].time
   */
  to: Date;
}