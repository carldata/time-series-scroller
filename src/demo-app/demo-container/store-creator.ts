import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { EnumRawCsvFormat } from '../../hp-time-series-chart/csv-loading/calculations';
import { hpTimeSeriesChartActionTypes } from '../../hp-time-series-chart/action-creators';
import { csvLoadingAuxiliary } from '../../hp-time-series-chart/csv-loading/auxiliary';
import { hpTimeSeriesCsvLoadingChartActionTypes } from '../../hp-time-series-chart/csv-loading/action-creators';
import { Action, handleActions, createAction } from "redux-actions";
import { hpTimeSeriesChartReducers } from "../../hp-time-series-chart/reducers";
import { IHpTimeSeriesChartState } from "../../hp-time-series-chart/state";
import { EnumZoomSelected, EnumTimeSeriesType } from "../../hp-time-series-chart/state/enums";
import { hpTimeSeriesChartReducerAuxFunctions } from '../../hp-time-series-chart/reducers-aux';
import { IExternalSourceTimeSeries } from '../..';

export const actions = {
  TWO_RANDOM_SERIES: 'TWO_RANDOM_SERIES',
  PREDEFINED_SERIES: 'PREDEFINED_SERIES'
}

export const actionCreators = {
  generateTwoRandomSeries: createAction<{ dateFrom: Date, dateTo: Date }, Date, Date>(
    actions.TWO_RANDOM_SERIES,
    (dateFrom: Date, dateTo: Date) => { return { dateFrom, dateTo } }
  )
}

export const storeCreator = handleActions<IHpTimeSeriesChartState, any>({
  [actions.TWO_RANDOM_SERIES]: (state: IHpTimeSeriesChartState, action: Action<{ dateFrom: Date, dateTo: Date }>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setData(state, { 
      type: hpTimeSeriesChartActionTypes.SET_DATA,
      payload: [
        <IExternalSourceTimeSeries> {
          color: "orange",
          name: "Time Series A",
          points: hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(action.payload.dateFrom, action.payload.dateTo),
          type: EnumTimeSeriesType.Line
        },
        <IExternalSourceTimeSeries> {
          color: "red",
          name: "Anomalies",
          points: hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(action.payload.dateFrom, action.payload.dateTo),
          type: EnumTimeSeriesType.DottedLine
        }]
      });
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
  [hpTimeSeriesChartActionTypes.SET_ZOOM]: (state: IHpTimeSeriesChartState, action: Action<EnumZoomSelected>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setZoom(state, action);
  }
}, hpTimeSeriesChartReducerAuxFunctions.buildInitialState());