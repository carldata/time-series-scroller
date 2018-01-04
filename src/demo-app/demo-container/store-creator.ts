import { hpTimeSeriesChartActionTypes } from '../../hp-time-series-chart/action-creators';
import { csvLoadingAuxiliary } from '../../hp-time-series-chart/csv-loading/auxiliary';
import { hpTimeSeriesCsvLoadingChartActionTypes } from '../../hp-time-series-chart/csv-loading/action-creators';
import * as _ from 'lodash';
import { Action, handleActions } from "redux-actions";
import { hpTimeSeriesChartReducers, hpTimeSeriesChartReducerAuxFunctions } from "../../hp-time-series-chart/reducers";
import { IHpTimeSeriesChartState } from "../../hp-time-series-chart/state";
import { EnumCsvDataType, ICsvDataLoadedContext } from '../../hp-time-series-chart/csv-loading/models';
import { EnumZoomSelected } from "../../hp-time-series-chart/state/enums";

export const storeCreator = handleActions<IHpTimeSeriesChartState, any>({
  [hpTimeSeriesChartActionTypes.GENERATE_RANDOM_DATA]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.generateRandomData(state, action)
  },
  [hpTimeSeriesCsvLoadingChartActionTypes.RECEIVED_CSV_DATA_CHUNK]: (state: IHpTimeSeriesChartState, action: Action<Array<any>>): IHpTimeSeriesChartState => {
    let [newState, timeSeries] = csvLoadingAuxiliary.receivedCsvDataChunk(state, action.payload);
    return _.extend({}, newState);
  },
  // [hpTimeSeriesCsvLoadingChartActionTypes.LOADING_CSV_DATA_SUCCEEDED]: (state: IHpTimeSeriesChartState, action: Action<Array<any>>): IHpTimeSeriesChartState => {
  //   let [newState, timeSeries] = csvLoadingAuxiliary.csvDataLoaded(state, action.payload);
  //   return _.extend({}, state, newState);
  // },
  [hpTimeSeriesChartActionTypes.SET_WINDOW_DATE_FROM_TO]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setWindowDateFromTo(state, action);
  },
  [hpTimeSeriesChartActionTypes.SET_WINDOW_WIDTH_MINUTES]: (state: IHpTimeSeriesChartState, action: Action<number>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setWindowWidthMinutes(state, action);
  },
  [hpTimeSeriesChartActionTypes.SET_ZOOM]: (state: IHpTimeSeriesChartState, action: Action<[EnumZoomSelected, number]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setZoom(state, action);
  }
}, hpTimeSeriesChartReducerAuxFunctions.buildInitialState());