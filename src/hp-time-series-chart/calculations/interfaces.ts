import { IDateTimePoint } from '../state/date-time-point';

export interface ITimeSeriesBucket {
  unixFrom: number;
  unixTo: number;
  date: Date;
  numberOfSamples: number;
  leftboundY: number;
  rightboundY: number;
  minY: number;
  maxY: number;
}

export interface ITimeSeriesBucketsOnScreen {
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