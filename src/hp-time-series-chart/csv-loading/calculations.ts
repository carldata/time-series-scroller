import { hpTimeSeriesChartCalculations } from '../calculations';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { ICsvDataLoadedContext, EnumCsvDataType } from './models';
import { IDateTimePoint } from '../state/date-time-point';
import { ITimeSeries } from '../state/time-series';

const debug = false;

const extractDateTimePoints = (csvRows: Array<any>): IDateTimePoint[] => {
  let result: IDateTimePoint[] = [];
  for (let i=0; i < csvRows.length; i++) {
    result.push({
      unix: parseInt(csvRows[i].unix),
      value: parseFloat(csvRows[i].value),
      event: false
    });
  }
  return result;
}

export const csvLoadingCalculations = {
  extractDateTimePoints
}