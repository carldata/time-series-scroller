// tslint:disable:max-classes-per-file
import { Action } from 'redux';
import * as actionTypes from './action-types';

class StartedProcessingCsvAction implements Action {
  public readonly type = actionTypes.STARTED_PROCESSING_CSV;
}

class ReceivedCsvChunkAction implements Action {
  public readonly type = actionTypes.RECEIVED_CSV_CHUNK;
  constructor(public data: any[]) { }
}

class FinishedProcessingCsvAction implements Action {
  public readonly type = actionTypes.FINISHED_PROCESSING_CSV;
  constructor(public data: any[]) { }
}

export {
  StartedProcessingCsvAction,
  ReceivedCsvChunkAction,
  FinishedProcessingCsvAction
};
