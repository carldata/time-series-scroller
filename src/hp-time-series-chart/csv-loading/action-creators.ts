import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";
import * as Papa from 'papaparse';

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  LOADING_CSV_DATA_SUCCEEDED: 'LOADING_CSV_DATA_SUCCEEDED'
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results, file) => {
        dispatch({
          type: hpTimeSeriesCsvLoadingChartActionTypes.LOADING_CSV_DATA_SUCCEEDED,
          payload: results.data
        });
      },
    });
  }
}

