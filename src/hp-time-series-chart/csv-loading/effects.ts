import * as _ from 'lodash';
import { Dispatch } from 'redux';
import * as Papa from 'papaparse';
import { Parser, ParseResult } from 'papaparse';
import { StartedProcessingCsvAction, ReceivedCsvChunkAction, FinishedProcessingCsvAction } from './actions';

type ILoadCsvEffect = (url: string, useStreaming: boolean) => (dispatch: Dispatch<{}>) => void;

const loadCsv: ILoadCsvEffect = (url: string, useStreaming: boolean = false) => (dispatch: Dispatch<{}>) => {
  dispatch(_.toPlainObject(new StartedProcessingCsvAction()));
  Papa.parse(url, {
    download: true,
    worker: false,
    header: true,
    skipEmptyLines: true,
    chunk: useStreaming ? 
      (results: ParseResult) => dispatch(_.toPlainObject(new ReceivedCsvChunkAction(results.data))) : 
      undefined,
    complete: (results: ParseResult) => dispatch(_.toPlainObject(new FinishedProcessingCsvAction(_.isObject(results) ? results.data : [])))
  });
}

export {
  ILoadCsvEffect,
  loadCsv
}