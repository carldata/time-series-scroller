import * as _ from "lodash";
import { chartActionName } from "../hpTimeSeriesChart/common/actionNameReducerMappings";
import { reducers } from "../hpTimeSeriesChart/common/reducers";
import { IAppState } from "../state";
import { Action, handleActions } from "redux-actions";
import { ICsvDataLoadedActionResponse } from "../hpTimeSeriesChart/common/csvLoading/models";
import { EnumChartPointsSelectionMode, EnumZoomSelected } from "../hpTimeSeriesChart/state/enums";


export default handleActions<IAppState, any>({
  [chartActionName(reducers.regenerateRandomData)]: (state: IAppState, action: Action<Date[]>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.regenerateRandomData(state.chartState, action)
    });
  },
  [chartActionName(reducers.csvDataLoadInitialize)]: (state: IAppState, action: Action<Date[]>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.csvDataLoadInitialize(state.chartState, action)
    });
  },
  [chartActionName(reducers.csvDataLoadFinalize)]: (state: IAppState, action: Action<ICsvDataLoadedActionResponse>): IAppState => {
    let [chartState, addedTimeSeries]  = reducers.csvDataLoadFinalize(state.chartState, action);
    return _.extend({}, state, <IAppState>{
      chartState: chartState
    });
  },
  [chartActionName(reducers.setEvents)]: (state: IAppState, action: Action<ICsvDataLoadedActionResponse>): IAppState => {
    return state;    
  },
  [chartActionName(reducers.setWindowDateFromTo)]: (state: IAppState, action: Action<Date[]>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.setWindowDateFromTo(state.chartState, action)
    });
  },
  [chartActionName(reducers.setWindowWidthMinutes)]: (state: IAppState, action: Action<number>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.setWindowWidthMinutes(state.chartState, action)
    });
  },
  [chartActionName(reducers.setChartPointsSelectionMode)]: (state: IAppState, action: Action<EnumChartPointsSelectionMode>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.setChartPointsSelectionMode(state.chartState, action)
    });
  },
  [chartActionName(reducers.setZoom)]: (state: IAppState, action: Action<EnumZoomSelected>): IAppState => {
    return _.extend({}, state, <IAppState>{
      chartState: reducers.setZoom(state.chartState, action)
    });
  }
}, <IAppState>{ 
  chartState: reducers.buildInitialState()
});
