import { IDateTimePoint } from '../state/date-time-point';

export interface ITimeSeriesBucket {
  unixFrom: number;
  unixTo: number;
  date: Date;
  min: number;
  max: number;
}

export interface IGetTimeSeriesBucketsResult {
  buckets: ITimeSeriesBucket[];
  preceding: ITimeSeriesBucket;
  succeeding: ITimeSeriesBucket;
}