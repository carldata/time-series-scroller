// tslint:disable:max-classes-per-file

import { Action } from 'redux';
import * as actionTypes from './action-types';

class GenerateTwoRandomSeriesDataAction implements Action {
  public readonly type = actionTypes.GENERATE_TWO_RANDOM_SERIES;
  constructor(public dateFrom: Date, public dateTo: Date) { }
}

export {
  GenerateTwoRandomSeriesDataAction,
};
