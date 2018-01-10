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
  let result: IUnixTimePoint[] = new Array(csvRows.length);
  for (let i=0; i < csvRows.length; i++) {
    result[i] = {
      unix: function() {
        switch (config.rawFormat) {
          case EnumRawCsvFormat.UnixTimeThenValue:
            return parseInt(csvRows[i][config.timeStampColumnName]);
          case EnumRawCsvFormat.DateTimeThenValue:
            return dateFns.parse(csvRows[i][config.timeStampColumnName]).getTime();
        }
      }(),
      value: parseFloat(csvRows[i][config.valueColumnName])
    };
  }
  return result;
}

export const csvLoadingCalculations = {
  extractUnixTimePoints
}