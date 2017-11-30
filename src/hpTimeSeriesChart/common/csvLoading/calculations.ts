import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IDateTimePoint } from '../../models/dateTimePoint';
import { IChartState } from '../../models/chartState';
import { ICsvDataLoadedActionResponse, EnumCsvDataType } from './models';

const debug = false;

const extractDateTimePointsOutOfCsvFileContents = (response: ICsvDataLoadedActionResponse): IDateTimePoint[] => {
  let result = new Array<IDateTimePoint>();  
  let lines = response.text.split(response.config.newLineCharacter)
  if (response.config.firstLineContainsHeaders)
    lines = _.drop(lines, 1);
  debug ? console.log(`first line is ${lines[0]}`) : null;
  _.each(lines, line => {
    let sample: IDateTimePoint = {
      date: new Date(),
      unix: 0,
      value: 0,
      envelopeValueMin: 0,
      envelopeValueMax: 0,
      event: false
    };
    let columnValues = line.split(response.config.delimiter);
    let columnValuesConversionsSucceeded = true;
    _.each(response.config.columns, column => {
      if (!column.display) 
        return;
      let stringValue =  columnValues[_.indexOf(response.config.columns, column)];
      switch (column.type) {
        case EnumCsvDataType.DateTime:
          let date = dateFns.parse(stringValue);
          if (dateFns.isValid(date)) {
            sample.date = date;
            sample.unix = dateFns.getTime(date);
          } else {
            console.log(`Failed for EnumCsvDataType.DateTime with ${stringValue}`);
            columnValuesConversionsSucceeded = false;
          }
          break;
        case EnumCsvDataType.Float:
          let parsed = parseFloat(stringValue);
          if (!isNaN(parsed)) {
            sample.value = parsed;
            sample.envelopeValueMin = parsed;
            sample.envelopeValueMax = parsed;
          }
          else {
            console.log(`Failed for EnumCsvDataType.Float with ${stringValue}`);
            columnValuesConversionsSucceeded = false;
          }
          break;
      }
    });
    if (columnValuesConversionsSucceeded)
      result.push(sample);
  });  
  return result;
}

const estimateSecondsPerSample = (array: IDateTimePoint[]): number => {
  if (array.length <= 1)
    return 1;
  return dateFns.differenceInSeconds(_.last(array).date, _.first(array).date) / (array.length-1);
}

export const calculations = {
  extractDateTimePointsOutOfCsvFileContents,
  estimateSecondsPerSample
}