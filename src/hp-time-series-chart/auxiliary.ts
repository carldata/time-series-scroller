import * as _ from "lodash";
import { IHpTimeSeriesChartState } from "./state";
import { IExternalSourceTimeSeries } from "./state/time-series";
import { hpTimeSeriesChartReducerAuxFunctions } from "./reducers-aux";
import { SetDataAction } from "./actions";
import { hpTimeSeriesChartReducer } from "./reducers";

const buildStateFromExternalSource = (series: IExternalSourceTimeSeries[]): IHpTimeSeriesChartState => 
  hpTimeSeriesChartReducer(hpTimeSeriesChartReducerAuxFunctions.buildInitialState(), new SetDataAction(series))

export const hpTimeSeriesChartAuxiliary = {
  buildStateFromExternalSource
}

