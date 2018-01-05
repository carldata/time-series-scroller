import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Parser, ParseResult } from 'papaparse';

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  STARTED_LOADING_CSV: 'STARTED_LOADING_CSV',
  RECEIVED_CSV_DATA_CHUNK: 'RECEIVED_CSV_DATA_CHUNK',
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    dispatch({
      type: hpTimeSeriesCsvLoadingChartActionTypes.STARTED_LOADING_CSV
    });
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