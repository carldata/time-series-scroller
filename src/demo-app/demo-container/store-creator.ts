import { EnumRawCsvFormat } from '../../hp-time-series-chart/csv-loading/calculations';
import { hpTimeSeriesChartActionTypes } from '../../hp-time-series-chart/action-creators';
import { csvLoadingAuxiliary } from '../../hp-time-series-chart/csv-loading/auxiliary';
import { hpTimeSeriesCsvLoadingChartActionTypes } from '../../hp-time-series-chart/csv-loading/action-creators';
import * as _ from 'lodash';
import { Action, handleActions } from "redux-actions";
import { hpTimeSeriesChartReducers, hpTimeSeriesChartReducerAuxFunctions } from "../../hp-time-series-chart/reducers";
import { IHpTimeSeriesChartState } from "../../hp-time-series-chart/state";
import { EnumZoomSelected } from "../../hp-time-series-chart/state/enums";

export const storeCreator = handleActions<IHpTimeSeriesChartState, any>({
  [hpTimeSeriesChartActionTypes.GENERATE_RANDOM_DATA]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.generateRandomData(state, action)
  },
  [hpTimeSeriesCsvLoadingChartActionTypes.STARTED_PROCESSING_CSV]: (state: IHpTimeSeriesChartState): IHpTimeSeriesChartState => {
    return _.extend({}, state, csvLoadingAuxiliary.startedLoadingCsvData(state));
  },
  [hpTimeSeriesCsvLoadingChartActionTypes.RECEIVED_CSV_CHUNK]: (state: IHpTimeSeriesChartState, action: Action<Array<any>>): IHpTimeSeriesChartState => {
    let [newState, timeSeries] = csvLoadingAuxiliary.receivedCsvDataChunk(state, true, action.payload, {
      rawFormat: EnumRawCsvFormat.UnixTimeThenValue,
      timeStampColumnName: "unix",
      valueColumnName: "value"
    });
    return _.extend({}, state, newState);
  },
  [hpTimeSeriesCsvLoadingChartActionTypes.FINISHED_PROCESSING_CSV]: (state: IHpTimeSeriesChartState, action: Action<Array<any>>): IHpTimeSeriesChartState => {
    let [newState, timeSeries] = csvLoadingAuxiliary.receivedCsvDataChunk(state, true, action.payload, {
      rawFormat: EnumRawCsvFormat.UnixTimeThenValue,
      timeStampColumnName: "unix",
      valueColumnName: "value"
    });
    return _.extend({}, state, newState);
  },
  [hpTimeSeriesChartActionTypes.SET_ZOOM]: (state: IHpTimeSeriesChartState, action: Action<[EnumZoomSelected, number]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setZoom(state, action);
  }
}, hpTimeSeriesChartReducerAuxFunctions.buildInitialState());