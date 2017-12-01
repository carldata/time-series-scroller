import * as _ from "lodash";
import { chartActionName } from "../hpTimeSeriesChart/common/actionNameReducerMappings";
import { reducers } from "../hpTimeSeriesChart/common/reducers";
import { IHpTimeSeriesChartState } from "../hpTimeSeriesChart/state";
import { Action, handleActions } from "redux-actions";
import { ICsvDataLoadedActionResponse } from "../hpTimeSeriesChart/common/csvLoading/models";
import { EnumChartPointsSelectionMode, EnumZoomSelected } from "../hpTimeSeriesChart/state/enums";


export const testComponentReducer = handleActions<IHpTimeSeriesChartState, any>({
  [chartActionName(reducers.generateRandomData)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return reducers.generateRandomData(state, action)
  },
  [chartActionName(reducers.csvDataLoadInitialize)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return _.extend({}, state, reducers.csvDataLoadInitialize(state, action));
  },
  [chartActionName(reducers.csvDataLoadFinalize)]: (state: IHpTimeSeriesChartState, action: Action<ICsvDataLoadedActionResponse>): IHpTimeSeriesChartState => {
    let [chartState, addedTimeSeries] = reducers.csvDataLoadFinalize(state, action);
    return chartState;
  },
  [chartActionName(reducers.setWindowDateFromTo)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return reducers.setWindowDateFromTo(state, action);
  },
  [chartActionName(reducers.setWindowWidthMinutes)]: (state: IHpTimeSeriesChartState, action: Action<number>): IHpTimeSeriesChartState => {
    return reducers.setWindowWidthMinutes(state, action);
  },
  [chartActionName(reducers.setChartPointsSelectionMode)]: (state: IHpTimeSeriesChartState, action: Action<EnumChartPointsSelectionMode>): IHpTimeSeriesChartState => {
    return reducers.setChartPointsSelectionMode(state, action);
  },
  [chartActionName(reducers.setZoom)]: (state: IHpTimeSeriesChartState, action: Action<EnumZoomSelected>): IHpTimeSeriesChartState => {
    return reducers.setZoom(state, action);
  }
},
  reducers.buildInitialState()
);
