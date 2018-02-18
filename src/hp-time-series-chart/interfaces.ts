import { ITimeSeriesBucket, IChartTimeSeriesBuckets } from './calculations/interfaces';
import { IUnixTimePoint } from './state/unix-time-point';
import { EnumZoomSelected } from './state/enums';

/**
 * Defines all the usable aspects for displaying time series in chart.
 */
export interface IChartTimeSeries {
  /**
   * Keep in mind the name attribute is reused as the React element key
   */
  name: string;
  color: string;
  buckets: IChartTimeSeriesBuckets;
}