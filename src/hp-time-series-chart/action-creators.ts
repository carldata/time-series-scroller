/**
 * Declares reusable actions that can be used by screen using this component  
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { createAction } from 'redux-actions';
import { Dispatch } from 'redux';
import * as collections from 'typescript-collections';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from './state/enums';
import { actionTypes as csvLoadingActionTypes, csvDataLoadInitialize, csvDataLoadFinalize } from './csv-loading/action-creators';
import { ICsvRawParseConfiguration, ICsvDataLoadedActionResponse } from './csv-loading/models';

export const chartActionTypes = {
  GENERATE_RANDOM_DATA: 'GENERATE_RANDOM_DATA',
  CSV_DATA_LOAD_INITIALIZE: csvLoadingActionTypes.CSV_DATA_LOAD_INITIALIZE,
  CSV_DATA_LOAD_FINALIZE: csvLoadingActionTypes.CSV_DATA_LOAD_FINALIZE,
  SET_EVENTS: 'SET_EVENTS',
  SET_WINDOW_DATE_FROM_TO: 'SET_WINDOW_DATE_FROM_TO',
  SET_WINDOW_WIDTH_MINUTES: 'SET_WINDOW_WIDTH_MINUTES',
  SET_CHART_POINTS_SELECTION_MODE: 'SET_CHART_POINTS_SELECTION_MODE',
  SET_ZOOM: 'SET_ZOOM',
  SCROLL_TO_THE_NEXT_FRAME: 'SCROLL_TO_THE_NEXT_FRAME',
  SCROLL_TO_THE_PREVIOUS_FRAME: 'SCROLL_TO_THE_PREVIOUS_FRAME'
};

/**
 * Public API of HP Time Series Chart component
 * This fragment of code that actually transforms call arguments 
 * (used in conjunction with dispatch(actionCall())) to action payload object 
 * (the returned type is the FIRST generic type parameter).
 */
export const chartActionCreators = {
  generateRandomData: createAction<Date[], Date[]>(
    chartActionTypes.GENERATE_RANDOM_DATA,
    (dates: Date[]) => dates
  ),
  csvDataLoad: csvDataLoadInitialize,
  csvDataLoaded: csvDataLoadFinalize,
  setEvents: createAction<collections.Dictionary<number, boolean>, number[]>(
    chartActionTypes.SET_EVENTS,
    (unixDatesContainingEvents: number[]) => {
      let result = new collections.Dictionary<number, boolean>();
      _.each(unixDatesContainingEvents, el => result.setValue(el, true));
      return result;
    }
  ), 
  setWindowDateFromTo: createAction<Date[], Date, Date>(
    chartActionTypes.SET_WINDOW_DATE_FROM_TO,
    (dateFrom: Date, dateTo: Date) => [dateFrom, dateTo]
  ),
  setWindowWidthMinutes: createAction<number, number>(
    chartActionTypes.SET_WINDOW_WIDTH_MINUTES,
    (v: number) => v
  ),
  setGraphPointsSelectionMode: createAction<EnumChartPointsSelectionMode, EnumChartPointsSelectionMode>(
    chartActionTypes.SET_CHART_POINTS_SELECTION_MODE,
    (v: EnumChartPointsSelectionMode) => v
  ),
  setZoomWindowLevel: createAction<EnumZoomSelected, EnumZoomSelected>(
    chartActionTypes.SET_ZOOM,
    (v: EnumZoomSelected) => v
  ),
  scrollToThePreviousFrame: createAction<void>(
    chartActionTypes.SCROLL_TO_THE_PREVIOUS_FRAME,
    () => null
  ),
  scrollToTheNextFrame: createAction<void>(
    chartActionTypes.SCROLL_TO_THE_NEXT_FRAME,
    () => null
  )
}
