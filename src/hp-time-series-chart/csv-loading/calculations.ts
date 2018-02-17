import { hpTimeSeriesChartCalculations } from '../calculations';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { ICsvDataLoadedContext, EnumCsvDataType } from './models';
import { IUnixTimePoint } from '../state/unix-time-point';
import { ITimeSeries } from '../state/time-series';

const debug = false;

export enum EnumRawCsvFormat {
  DateTimeThenValue,
  UnixTimeThenValue,
}

export interface IExtractUnixTimePointsConfig {
  rawFormat: EnumRawCsvFormat;
  timeStampColumnName: string;
  valueColumnName: string;
}

const extractUnixTimePoints = (csvRows: Array<any>, config: IExtractUnixTimePointsConfig): IUnixTimePoint[] => {
  return _.map(csvRows, (row: any) => { return {
    unix: (() => {
      switch (config.rawFormat) {
        case EnumRawCsvFormat.UnixTimeThenValue:
          return parseInt(row[config.timeStampColumnName]);
        case EnumRawCsvFormat.DateTimeThenValue:
          return dateFns.parse(row[config.timeStampColumnName]).getTime();
      }
    })(),
    value: parseFloat(row[config.valueColumnName])
  }});
}

export const csvLoadingCalculations = {
  extractUnixTimePoints
}