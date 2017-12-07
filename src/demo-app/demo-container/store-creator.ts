import * as _ from "lodash";
import { Action, handleActions } from "redux-actions";
import { reducerActionTypeMapper } from "../../hp-time-series-chart/reducer-action-type-mapper";
import { reducers, reducerAuxFunctions } from "../../hp-time-series-chart/reducers";
import { IHpTimeSeriesChartState } from "../../hp-time-series-chart/state";
import { ICsvDataLoadedActionResponse } from "../../hp-time-series-chart/csv-loading/models";
import { EnumChartPointsSelectionMode, EnumZoomSelected } from "../../hp-time-series-chart/state/enums";

export const storeCreator = handleActions<IHpTimeSeriesChartState, any>({
  [reducerActionTypeMapper(reducers.generateRandomData)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return reducers.generateRandomData(state, action)
  },
  [reducerActionTypeMapper(reducers.csvDataLoadInitialize)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return _.extend({}, state, reducers.csvDataLoadInitialize(state, action));
  },
  [reducerActionTypeMapper(reducers.csvDataLoadFinalize)]: (state: IHpTimeSeriesChartState, action: Action<ICsvDataLoadedActionResponse>): IHpTimeSeriesChartState => {
    let [chartState, addedTimeSeries] = reducers.csvDataLoadFinalize(state, action);
    return chartState;
  },
  [reducerActionTypeMapper(reducers.setWindowDateFromTo)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return reducers.setWindowDateFromTo(state, action);
  },
  [reducerActionTypeMapper(reducers.setWindowWidthMinutes)]: (state: IHpTimeSeriesChartState, action: Action<number>): IHpTimeSeriesChartState => {
    return reducers.setWindowWidthMinutes(state, action);
  },
  [reducerActionTypeMapper(reducers.setChartPointsSelectionMode)]: (state: IHpTimeSeriesChartState, action: Action<EnumChartPointsSelectionMode>): IHpTimeSeriesChartState => {
    return reducers.setChartPointsSelectionMode(state, action);
  },
  [reducerActionTypeMapper(reducers.setZoom)]: (state: IHpTimeSeriesChartState, action: Action<EnumZoomSelected>): IHpTimeSeriesChartState => {
    return reducers.setZoom(state, action);
  }
},
  reducerAuxFunctions.buildInitialState()
);