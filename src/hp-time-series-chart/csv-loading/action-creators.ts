import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';
import * as _ from 'lodash';
import { Parser, ParseResult } from 'papaparse';

const RESULTS_CACHE_MAX_SIZE = 2000000;

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  STARTED_PROCESSING_CSV: 'STARTED_PROCESSING_CSV',
  RECEIVED_CSV_CHUNK: 'RECEIVED_CSV_CHUNK',
  FINISHED_PROCESSING_CSV: 'FINISHED_PROCESSING_CSV',
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    dispatch({
      type: hpTimeSeriesCsvLoadingChartActionTypes.STARTED_PROCESSING_CSV
    });
    let resultsCache = new Array(RESULTS_CACHE_MAX_SIZE);
    let resultsCacheIndex = 0;
    Papa.parse(url, {
      download: true,
      worker: false,
      header: true,
      skipEmptyLines: true,
      step: (results: ParseResult) => {
        resultsCache[resultsCacheIndex++] = results.data[0];
        if (resultsCacheIndex >= RESULTS_CACHE_MAX_SIZE) {
          dispatch({
            type: hpTimeSeriesCsvLoadingChartActionTypes.RECEIVED_CSV_CHUNK,
            payload: resultsCache
          });
          resultsCacheIndex = 0;
        }
      },
      complete: () => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.FINISHED_PROCESSING_CSV,
          payload: _.slice(resultsCache, 0, resultsCacheIndex)
        });
      }
    });
  }
}