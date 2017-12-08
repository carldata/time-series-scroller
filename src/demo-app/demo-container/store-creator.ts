import * as _ from "lodash";
import { Action, handleActions } from "redux-actions";
import { reducerActionTypeMapper } from "../../hp-time-series-chart/reducer-action-type-mapper";
import { hpTimeSeriesChartReducers, hpTimeSeriesChartReducerAuxFunctions } from "../../hp-time-series-chart/reducers";
import { IHpTimeSeriesChartState } from "../../hp-time-series-chart/state";
import { ICsvDataLoadedContext } from "../../hp-time-series-chart/csv-loading/models";
import { EnumChartPointsSelectionMode, EnumZoomSelected } from "../../hp-time-series-chart/state/enums";

export const storeCreator = handleActions<IHpTimeSeriesChartState, any>({
  [reducerActionTypeMapper(hpTimeSeriesChartReducers.generateRandomData)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.generateRandomData(state, action)
  },
  [reducerActionTypeMapper(hpTimeSeriesChartReducers.setWindowDateFromTo)]: (state: IHpTimeSeriesChartState, action: Action<Date[]>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setWindowDateFromTo(state, action);
  },
  [reducerActionTypeMapper(hpTimeSeriesChartReducers.setWindowWidthMinutes)]: (state: IHpTimeSeriesChartState, action: Action<number>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setWindowWidthMinutes(state, action);
  },
  [reducerActionTypeMapper(hpTimeSeriesChartReducers.setChartPointsSelectionMode)]: (state: IHpTimeSeriesChartState, action: Action<EnumChartPointsSelectionMode>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setChartPointsSelectionMode(state, action);
  },
  [reducerActionTypeMapper(hpTimeSeriesChartReducers.setZoom)]: (state: IHpTimeSeriesChartState, action: Action<EnumZoomSelected>): IHpTimeSeriesChartState => {
    return hpTimeSeriesChartReducers.setZoom(state, action);
  }
},
hpTimeSeriesChartReducerAuxFunctions.buildInitialState()
);