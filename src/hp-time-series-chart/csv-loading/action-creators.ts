import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Parser, ParseResult } from 'papaparse';

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  STARTED_LOADING_CSV: 'STARTED_LOADING_CSV',
  FINISHED_LOADING_CSV: 'FINISHED_LOADING_CSV',
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    dispatch({
      type: hpTimeSeriesCsvLoadingChartActionTypes.STARTED_LOADING_CSV
    });
    Papa.parse(url, {
      download: true,
      worker: false,
      header: true,
      skipEmptyLines: true, 
      complete: (results: ParseResult, file?: File) => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.FINISHED_LOADING_CSV,
          payload: results.data
        });
      }
    });
  }
}