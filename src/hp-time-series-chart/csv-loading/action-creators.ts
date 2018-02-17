import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Parser, ParseResult } from 'papaparse';

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  STARTED_PROCESSING_CSV: 'STARTED_PROCESSING_CSV',
  RECEIVED_CSV_CHUNK: 'RECEIVED_CSV_CHUNK',
  FINISHED_PROCESSING_CSV: 'FINISHED_PROCESSING_CSV',
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string, useStreaming: boolean = false) => (dispatch: Dispatch<{}>) => {
    dispatch({
      type: hpTimeSeriesCsvLoadingChartActionTypes.STARTED_PROCESSING_CSV
    });
    Papa.parse(url, {
      download: true,
      worker: false,
      header: true,
      skipEmptyLines: true,
      chunk: useStreaming ? (results: ParseResult) => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.RECEIVED_CSV_CHUNK,
          payload: results.data
        });
      } : undefined,
      complete: (results: ParseResult) => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.FINISHED_PROCESSING_CSV,
          payload: _.isObject(results) ? results.data : []
        });
      }
    });
  }
}