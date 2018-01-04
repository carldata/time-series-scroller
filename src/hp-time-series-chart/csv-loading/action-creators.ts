import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Parser, ParseResult } from 'papaparse';

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  RECEIVED_CSV_DATA_CHUNK: 'RECEIVED_CSV_DATA_CHUNK',
  LOADING_CSV_DATA_SUCCEEDED: 'LOADING_CSV_DATA_SUCCEEDED'
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    Papa.parse(url, {
      download: true,
      worker: true,
      header: true,
      skipEmptyLines: true, 
      chunk: (results: ParseResult, parser: Parser) => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.RECEIVED_CSV_DATA_CHUNK,
          payload: results.data
        });
      }
    });
  }
}