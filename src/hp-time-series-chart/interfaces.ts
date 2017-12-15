import { IDateTimePoint } from './state/date-time-point';
import { EnumZoomSelected } from './state/enums';

export interface IZoomCacheElementDescription {
  rFactorMin: number, 
  rFactorMax: number,
  resampled: boolean,
}

/**
 * Defines all the usable aspects for displaying time series in chart.
 */
export interface IChartTimeSeries {
  /**
   * Keep in mind the name attribute is reused as the React element key
   */
  name: string;
  /**
   * The resample factor
   */
  rFactor: number;

  /**
   * How many pixels are there between two consecutive points of the continous series 
   */
  horizontalSampleDistancePx: number;

  color: string;

  points: IDateTimePoint[];

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

export interface IPluginFunctions {
  getDataResampled?: IGetDataResampledFunction;  
}

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