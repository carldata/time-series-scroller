import { ITimeSeriesBucket } from './calculations/time-series-bucket';
import { IDateTimePoint } from './state/date-time-point';
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
  buckets: ITimeSeriesBucket[];
  lefthandBucket: ITimeSeriesBucket;
  righthandBucket: ITimeSeriesBucket;
}

/**
 * Different read-only dimensions provided in creation time 
 */
export interface IChartDimensions {
  canvasWidth: number;
  canvasHeight: number;
  /**
   * The following padding values appy to main chart only !
   */
  timeSeriesChartPaddingBottom: number;
  timeSeriesChartPaddingTop: number;
  timeSeriesChartPaddingLeft: number;
  timeSeriesChartPaddingRight: number;
}

export interface IGetDataResampledFunction {
  (data: IDateTimePoint[], rFactor: number): IDateTimePoint[];
}

// export interface IPluginFunctions {
//   getDataResampled?: IGetDataResampledFunction;  
// }

/**
 * If active, represents a shape of evert rectangle drawn 
 * on the bottom of screeen (in spectrogram chart)
 */
export interface IEventChartConfiguration {
  heightPx: number;
  /**
   * fill color of an rectangle representing event
   */
  fillColor: string;
}