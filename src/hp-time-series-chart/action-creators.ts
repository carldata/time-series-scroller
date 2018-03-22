/**
 * Declares reusable actions that can be used by screen using this component  
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { IExternalSourceTimeSeries } from './state/time-series';
import { GenerateRandomDataAction, SetDataAction } from './actions';

type IGenerateRandomDataActionActionCreator = (from: Date, to: Date) => GenerateRandomDataAction;
type ISetDataActionCreator = (series: IExternalSourceTimeSeries[]) => SetDataAction;

const generateRandomData: IGenerateRandomDataActionActionCreator = (from: Date, to: Date) =>
  _.toPlainObject(new GenerateRandomDataAction(from, to));

const setData: ISetDataActionCreator = (series: IExternalSourceTimeSeries[]) =>
  _.toPlainObject(new SetDataAction(series));

export {
  IGenerateRandomDataActionActionCreator,
  generateRandomData,
  ISetDataActionCreator,
  setData
};