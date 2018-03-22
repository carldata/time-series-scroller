import * as _ from 'lodash';
import { GenerateTwoRandomSeriesDataAction } from './actions';

type IGenerateTwoRandomSeriesActionCreator = (from: Date, to: Date) => GenerateTwoRandomSeriesDataAction;

const generateTwoRandomSeries: IGenerateTwoRandomSeriesActionCreator = (from: Date, to: Date) =>
  _.toPlainObject(new GenerateTwoRandomSeriesDataAction(from, to));

export {
  IGenerateTwoRandomSeriesActionCreator,
  generateTwoRandomSeries,
};