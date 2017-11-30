import { EnumTimeSeriesDisplayStyle } from './enums';
import { IChartZoomSettings } from './chartZoomSettings';
import { IDateTimePoint } from './dateTimePoint';
import { IDateTimePointSeriesCache } from './dateTimePointSeriesCache';

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
   * Minimum y-value as found in the points array
   */
  yMinValue: number;
  /**
   * Maximum y-value as found in the points array
   */
  yMaxValue: number;

  /**
   * Equivalent of points[0].time
   */
  from: Date;

  /**
   * Equivalent of points[points.length-1].time
   */
  to: Date;

  /**
   * The declared density provided in data: DateTimePoint[] collection,
   * keep in mind it is just a declaration and real data can contain holes !
   */ 
  secondsPerSample: number;

  /**
   * Decides whether resample factor-based sample cache (rFactorSampleCache) is created
   */
  applyResampling: boolean;

  displayStyle: EnumTimeSeriesDisplayStyle;

  rFactorSampleCache: IDateTimePointSeriesCache[];
}