import * as _ from "lodash";
import { IHpTimeSeriesChartState } from "./state";
import { hpTimeSeriesChartReducers } from "../hp-time-series-chart/reducers";
import { hpTimeSeriesChartActionTypes } from "../hp-time-series-chart/action-creators";
import { IExternalSourceTimeSeries } from "./state/time-series";
import { hpTimeSeriesChartReducerAuxFunctions } from "./reducers-aux";

const seriesContainsData = (series: IExternalSourceTimeSeries[]): boolean => 
_.reduce(series, (acc, el) => acc || (el.points.length > 0), false)

const buildStateFromExternalSource = (series: IExternalSourceTimeSeries[]): IHpTimeSeriesChartState => {
return seriesContainsData(series) ? 
  hpTimeSeriesChartReducers.setData(null, { 
    type: hpTimeSeriesChartActionTypes.SET_DATA,
    payload: series
  }) : hpTimeSeriesChartReducerAuxFunctions.buildInitialState();
}

export const hpTimeSeriesChartAuxiliary = {
  buildStateFromExternalSource
}

