import * as _ from 'lodash';
import { GenerateRandomSeriesDataAction } from './actions';

type IGenerateRandomSeriesActionCreator = (from: Date, to: Date) => GenerateRandomSeriesDataAction;

const generateRandomSeries: IGenerateRandomSeriesActionCreator = (from: Date, to: Date) =>
  _.toPlainObject(new GenerateRandomSeriesDataAction(from, to));

export {
  IGenerateRandomSeriesActionCreator,
  generateRandomSeries,
};