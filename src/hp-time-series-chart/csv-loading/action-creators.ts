import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  LOADING_CSV_DATA_SUCCEEDED: 'LOADING_CSV_DATA_SUCCEEDED'
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (url: string) => (dispatch: Dispatch<{}>) => {
    axios.get("10k.csv").then((response: AxiosResponse) => {
      dispatch({
        type: hpTimeSeriesCsvLoadingChartActionTypes.LOADING_CSV_DATA_SUCCEEDED,
        payload: response.data
      });
    });
  }
}

