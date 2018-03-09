import { IChartZoomSettings } from './chart-zoom-settings';
import { IUnixTimePoint } from './unix-time-point';
import { EnumTimeSeriesType } from './enums';
import { IChartTimeSeriesBuckets } from '../calculations/interfaces';

export interface IBaseTimeSeries {
  /**
   * Attribute is reused as the React element key
   */
  name: string;
  color: string;
  type: EnumTimeSeriesType;
}

/**
 * Defines all the aspects required for displaying time series on screen.
 */
export interface IOnScreenTimeSeries extends IBaseTimeSeries {
  /** 
   * Identifier that is used in React key - it makes possible to display 
   * sematically the same time series that consists of different fragments -
   * as a matter of fact each fragment (on screen) is a different time series
   */
  fragmentId: number;
  buckets: IChartTimeSeriesBuckets;
}

/**
 * Time series as loaded from external source (other component/container)
 * Part of public API
 */
export interface IExternalSourceTimeSeries extends IBaseTimeSeries {
  points: IUnixTimePoint[];
}

/** 
 * Time series as used internally in the Redux state
*/
export interface IHpTimeSeriesChartTimeSeries extends IExternalSourceTimeSeries  {
  /**
   * Map introduced for optimization allowing us quckly find index of the 
   * first sample in points array for a given "bucket from" unix timestamp -
   * this is bucketing over raw data to: 
   * 1) make "filter" operation much faster
   * 2) avoid creation of filtered array of the raw data. 
   */
  unixToIndexMap: Map<number, number>;  
  unixFrom: number;
  unixTo: number;
}