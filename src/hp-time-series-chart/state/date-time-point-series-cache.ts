import { IDateTimePoint } from './date-time-point';

/**
 * Describes a single cache entry
 */
export interface IDateTimePointSeriesCache {
  /**
   * Resample Factor - key for every cache entry
   */
  rFactor: number;

  /**
   * For a value set to true, for zoom level other than EnumZoomSelected.NoZoom,
   * zoomLvlSamples should be recalculated based on allSamples array
   * every time zoom level is changed.
   */
  recreateZoomedSamplesEveryTimeZoomLevelChanged: boolean;

  /**
   * Are noZoomSamples resampled or real data ?
   */
  resampled: boolean;

  /**
   * Samples for this rFactor level (resampled values)
   */
  noZoomSamples: IDateTimePoint[];

  /**
   * Samples taken from noZoomSamples - but only limited to a current zoom level.
   * Recalculated every time zoom level gets changed.
   * So, this array makes sense in Zoom Level 1 or in Zoom Level 2.
   * If we seeing detailed view with, say, every second accuracy and 
   * we are in "Zoom Level 2", there is no point in scanning
   * millions of samples, that are present in all samples cache.
   */
  zoomedSamples: IDateTimePoint[];
}
