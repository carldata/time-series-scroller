import * as _ from 'lodash';
import { chartActionTypes } from './action-creators';
import { reducers, auxFunctions } from './reducers';

interface IReducerActionTypeMapping {
  action: Function;
  name: string;
}

let mappings: Array<IReducerActionTypeMapping> = [
  <IReducerActionTypeMapping>{
    name: chartActionTypes.CSV_DATA_LOAD_INITIALIZE,
    action: reducers.csvDataLoadInitialize
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.CSV_DATA_LOAD_FINALIZE,
    action: reducers.csvDataLoadFinalize
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.GENERATE_RANDOM_DATA,
    action: reducers.generateRandomData
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.SET_CHART_POINTS_SELECTION_MODE,
    action: reducers.setChartPointsSelectionMode
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.SET_WINDOW_DATE_FROM_TO,
    action: reducers.setWindowDateFromTo
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.SET_WINDOW_WIDTH_MINUTES,
    action: reducers.setWindowWidthMinutes
  },
  <IReducerActionTypeMapping>{
    name: chartActionTypes.SET_ZOOM,
    action: reducers.setZoom
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