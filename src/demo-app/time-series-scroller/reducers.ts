import * as _ from "lodash";
import { IHpTimeSeriesChartState } from  "../../hp-time-series-chart/state";
import { hpTimeSeriesChartReducer } from "../../hp-time-series-chart/reducers";
import { GenerateTwoRandomSeriesDataAction } from "./actions";
import { ReceivedCsvChunkAction, FinishedProcessingCsvAction, StartedProcessingCsvAction } from "../../hp-time-series-chart/csv-loading/actions";
import { SetDataAction } from "../../hp-time-series-chart/actions";
import { IExternalSourceTimeSeries } from "../../hp-time-series-chart/state/time-series";
import { hpTimeSeriesChartReducerAuxFunctions } from "../../hp-time-series-chart/reducers-aux";
import { EnumTimeSeriesType } from "../../hp-time-series-chart/state/enums";
import { GENERATE_TWO_RANDOM_SERIES } from "./action-types";
import { STARTED_PROCESSING_CSV, RECEIVED_CSV_CHUNK, FINISHED_PROCESSING_CSV } from "../../hp-time-series-chart/csv-loading/action-types";
import { csvLoadingAuxiliary } from "../../hp-time-series-chart/csv-loading/auxiliary";
import { EnumRawCsvFormat } from "../../hp-time-series-chart/csv-loading/calculations";

export type DemoContainerReducerActionTypes = GenerateTwoRandomSeriesDataAction|StartedProcessingCsvAction|ReceivedCsvChunkAction|FinishedProcessingCsvAction;

const initialState = hpTimeSeriesChartReducerAuxFunctions.buildInitialState();

export const demoContainerReducer = (state: IHpTimeSeriesChartState = initialState, action: DemoContainerReducerActionTypes): IHpTimeSeriesChartState => {
  switch (action.type) {
    case GENERATE_TWO_RANDOM_SERIES:
      return hpTimeSeriesChartReducer(state, new SetDataAction([
        <IExternalSourceTimeSeries> {
          color: "orange",
          name: "Time Series A",
          points: hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(action.dateFrom, action.dateTo),
          type: EnumTimeSeriesType.Line
        },
        <IExternalSourceTimeSeries> {
          color: "red",
          name: "Anomalies",
          points: hpTimeSeriesChartReducerAuxFunctions.randomContinousUnixTimePoints(action.dateFrom, action.dateTo),
          type: EnumTimeSeriesType.DottedLine
        }]
      ));
    case STARTED_PROCESSING_CSV:
      return _.extend({}, state, csvLoadingAuxiliary.startedLoadingCsvData(state));
    case RECEIVED_CSV_CHUNK:
    case FINISHED_PROCESSING_CSV:
      let [newState, timeSeries] = csvLoadingAuxiliary.receivedCsvDataChunk(state, true, action.data, {
        rawFormat: EnumRawCsvFormat.UnixTimeThenValue,
        timeStampColumnName: "unix",
        valueColumnName: "value"
      });
      return _.extend({}, state, newState);
    default:
      return state;
  }
}