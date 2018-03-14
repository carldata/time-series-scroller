import { IUnixTimePoint } from '../state/unix-time-point';

export interface ITimeSeriesBucket {
  /**
   * The first sample that was classified to bucket
   */
  firstSample: IUnixTimePoint;
  /**
   * The last sample that was classified to bucket
   */
  lastSample: IUnixTimePoint;
  /**
   * The left unix boundary of the bucket
   */  
  unixFrom: number;
  /**
   * The right unix boundary of the bucket
   */
  unixTo: number;
  /**
   * The calculated date bucket represents
   */
  date: Date;
  /**
   * Number of samples that are classified to bucket;
   * please note bucket does not keep samples (with the exception of first/last), 
   * only the number of them
   */
  numberOfSamples: number;
  /**
   * Maximim Y value of samples that are classified to bucket;
   * please note bucket does not keep samples (with the exception of first/last), 
   * only the max value found
   */
  minY: number;
  /**
   * Minimum Y value of samples that are classified to bucket;
   * please note bucket does not keep samples (with the exception of first/last), 
   * only the max value found
   */
  maxY: number;
}

export interface IChartTimeSeriesBuckets {
  buckets: ITimeSeriesBucket[];
  /**
   * Shadow bucket represents samples not visible on chart, 
   * yet in some cases we want to have this point visualized
   */
  shadowPreceding: ITimeSeriesBucket;
  /**
   * Shadow bucket represents samples not visible on chart, 
   * yet in some cases we want to have this point visualized
   */
  shadowSucceeding: ITimeSeriesBucket;
}