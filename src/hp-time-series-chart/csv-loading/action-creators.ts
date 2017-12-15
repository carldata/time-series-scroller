import { Dispatch } from 'redux';
import axios, { AxiosResponse } from 'axios';
import { createAction } from "redux-actions";

export const hpTimeSeriesCsvLoadingChartActionTypes = {
  LOADING_CSV_DATA_SUCCEEDED: 'LOADING_CSV_DATA_SUCCEEDED'
};

export const hpTimeSeriesChartCsvLoadingActionCreators = {
  loadCsv: (widthPx: number, url: string) => (dispatch: Dispatch<{}>) => {
    axios.get(url).then((response: AxiosResponse) => {
      dispatch({
        type: hpTimeSeriesCsvLoadingChartActionTypes.LOADING_CSV_DATA_SUCCEEDED,
        payload: [widthPx, response.data]
      });
    });
  }
}

