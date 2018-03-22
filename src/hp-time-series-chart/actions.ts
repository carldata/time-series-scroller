// tslint:disable:max-classes-per-file

import { Action } from 'redux';
import * as actionTypes from './action-types';
import { IExternalSourceTimeSeries } from './state/time-series';

class GenerateRandomDataAction implements Action {
  public readonly type = actionTypes.GENERATE_RANDOM_DATA;
  constructor(public from: Date, public to: Date) { }
}

class SetDataAction implements Action {
  public readonly type = actionTypes.SET_DATA;
  constructor(public series: IExternalSourceTimeSeries[]) { }
}

export {
  GenerateRandomDataAction,
  SetDataAction
};
