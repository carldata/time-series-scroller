import * as _ from 'lodash';
import { hpTimeSeriesChartActionTypes } from './action-creators';
import { hpTimeSeriesChartReducers, hpTimeSeriesChartReducerAuxFunctions } from './reducers';

export interface IReducerActionTypeMapping {
  action: Function;
  name: string;
}

const mappings: Array<IReducerActionTypeMapping> = [
  <IReducerActionTypeMapping>{
    name: hpTimeSeriesChartActionTypes.GENERATE_RANDOM_DATA,
    action: hpTimeSeriesChartReducers.generateRandomData
  },
  <IReducerActionTypeMapping>{
    name: hpTimeSeriesChartActionTypes.SET_CHART_POINTS_SELECTION_MODE,
    action: hpTimeSeriesChartReducers.setChartPointsSelectionMode
  },
  <IReducerActionTypeMapping>{
    name: hpTimeSeriesChartActionTypes.SET_WINDOW_DATE_FROM_TO,
    action: hpTimeSeriesChartReducers.setWindowDateFromTo
  },
  <IReducerActionTypeMapping>{
    name: hpTimeSeriesChartActionTypes.SET_WINDOW_WIDTH_MINUTES,
    action: hpTimeSeriesChartReducers.setWindowWidthMinutes
  },
  <IReducerActionTypeMapping>{
    name: hpTimeSeriesChartActionTypes.SET_ZOOM,
    action: hpTimeSeriesChartReducers.setZoom
  }
];

/**
 * actionName() should be applied when creating reducers designed for higher-order components/screens,
 * where actions names (part of the HP Time Series Chart public API) are mapped to higher-order reducers,
 * that call, in turn, HP Time Series Chart reducers 
 */
export const reducerActionTypeMapper = (reducer: Function): string => {
  const mapping = _.find(mappings, el => el.action === reducer);
  return _.isObject(mapping) ? mapping.name : "";
}