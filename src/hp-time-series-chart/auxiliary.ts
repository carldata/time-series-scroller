import * as _ from "lodash";
import { IHpTimeSeriesChartState } from "./state";
import { hpTimeSeriesChartReducers } from "../hp-time-series-chart/reducers";
import { hpTimeSeriesChartActionTypes } from "../hp-time-series-chart/action-creators";
import { IExternalSourceTimeSeries } from "./state/time-series";
import { hpTimeSeriesChartReducerAuxFunctions } from "./reducers-aux";

export const hpTimeSeriesChartAuxiliary = {
  buildStateFromExternalSource: (series: IExternalSourceTimeSeries[]): IHpTimeSeriesChartState => {
    return _.isEmpty(series) ? 
      hpTimeSeriesChartReducerAuxFunctions.buildInitialState() : 
      hpTimeSeriesChartReducers.setData(null, { 
        type: hpTimeSeriesChartActionTypes.SET_DATA,
        payload: series
      });
  }
}

