// tslint:disable:max-classes-per-file

import { Action } from 'redux';
import * as actionTypes from './action-types';
import { IExternalSourceTimeSeries } from './state/time-series';
import { IUnixTimeRangeSelection } from './state/unix-time-range-selection';

class GenerateRandomDataAction implements Action {
  public readonly type = actionTypes.GENERATE_RANDOM_DATA;
  constructor(public from: Date, public to: Date) { }
}

class SetDataAction implements Action {
  public readonly type = actionTypes.SET_DATA;
  constructor(public series: IExternalSourceTimeSeries[]) { }
}

class AddRangeSelectionAction implements Action {
  public readonly type = actionTypes.ADD_RANGE_SELECTION;
  constructor(public selection: IUnixTimeRangeSelection) { }
}

class RemoveRangeSelectionAction implements Action {
  public readonly type = actionTypes.REMOVE_RANGE_SELECTION;
  constructor(public unix: number) { }
}

export {
  GenerateRandomDataAction,
  SetDataAction,
  AddRangeSelectionAction,
  RemoveRangeSelectionAction
};
