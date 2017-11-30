import * as _ from 'lodash';
import { chartActionTypes } from './action-creators';
import { reducers } from './reducers';

interface IActionNameReducerMapping {
  name: string;
  action: Function;
}

let mappings: Array<IActionNameReducerMapping> = [
  <IActionNameReducerMapping>{
    name: chartActionTypes.CSV_DATA_LOAD_INITIALIZE,
    action: reducers.csvDataLoadInitialize
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.CSV_DATA_LOAD_FINALIZE,
    action: reducers.csvDataLoadFinalize
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.REGENERATE_RANDOM_DATA,
    action: reducers.regenerateRandomData
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.SET_CHART_POINTS_SELECTION_MODE,
    action: reducers.setChartPointsSelectionMode
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.SET_WINDOW_DATE_FROM_TO,
    action: reducers.setWindowDateFromTo
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.SET_WINDOW_WIDTH_MINUTES,
    action: reducers.setWindowWidthMinutes
  },
  <IActionNameReducerMapping>{
    name: chartActionTypes.SET_ZOOM,
    action: reducers.setZoom
  },
  // Frame scroll not supported for now...
  // <IActionNameReducerMapping>{
  //   name: chartActionNames.SCROLL_TO_THE_PREVIOUS_FRAME,
  //   action: reducers.scrollToThePreviousFrame
  // },
  // <IActionNameReducerMapping>{
  //   name: chartActionNames.SCROLL_TO_THE_NEXT_FRAME,
  //   action: reducers.scrollToTheNextFrame
  // }
];

/**
 * actionName() should be applied when creating reducers designed for higher-order components/screens,
 * where actions names (part of the HP Time Series Chart public API) are mapped to higher-order reducers,
 * that call, in turn, HP Time Series Chart reducers 
 */
export let chartActionName = (reducer: Function): string => {
  let mapping = _.find(mappings, el => el.action === reducer);
  return _.isObject(mapping) ? mapping.name : "";
}