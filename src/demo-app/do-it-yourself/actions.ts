// tslint:disable:max-classes-per-file

import { Action } from 'redux';
import * as actionTypes from './action-types';

class GenerateRandomSeriesDataAction implements Action {
  public readonly type = actionTypes.GENERATE_RANDOM_SERIES;
  constructor(public dateFrom: Date, public dateTo: Date) { }
}

export {
  GenerateRandomSeriesDataAction,
};
