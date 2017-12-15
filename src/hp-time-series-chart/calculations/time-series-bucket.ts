import { IDateTimePoint } from '../state/date-time-point';

export interface ITimeSeriesBucket {
  unixFrom: number;
  unixTo: number;
  samples: IDateTimePoint[];
}