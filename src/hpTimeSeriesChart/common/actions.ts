/**
 * Declares reusable actions that can be used by screen using this component  
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { createAction } from 'redux-actions';
import { Dispatch } from 'redux';
import * as collections from 'typescript-collections';
import { EnumChartPointsSelectionMode, EnumZoomSelected } from '../models/enums';
import { actionNames as csvLoadingActionNames, csvDataLoadInitialize, csvDataLoadFinalize } from './csvLoading/actions';
import { ICsvRawParseConfiguration, ICsvDataLoadedActionResponse } from './csvLoading/models';

export const chartActionNames = {
  REGENERATE_RANDOM_DATA: 'REGENERATE_RANDOM_DATA',
  CSV_DATA_LOAD_INITIALIZE: csvLoadingActionNames.CSV_DATA_LOAD_INITIALIZE,
  CSV_DATA_LOAD_FINALIZE: csvLoadingActionNames.CSV_DATA_LOAD_FINALIZE,
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
export const chartActions = {
  regenerateRandomData: createAction<Date[], Date[]>(
    chartActionNames.REGENERATE_RANDOM_DATA,
    (dates: Date[]) => dates
  ),
  csvDataLoad: csvDataLoadInitialize,
  csvDataLoaded: csvDataLoadFinalize,
  setEvents: createAction<collections.Dictionary<number, boolean>, number[]>(
    chartActionNames.SET_EVENTS,
    (unixDatesContainingEvents: number[]) => {
      let result = new collections.Dictionary<number, boolean>();
      _.each(unixDatesContainingEvents, el => result.setValue(el, true));
      return result;
    }
  ), 
  setWindowDateFromTo: createAction<Date[], string, string>(
    chartActionNames.SET_WINDOW_DATE_FROM_TO,
    (from: string, to: string) => [dateFns.parse(from), dateFns.parse(to)]
  ),
  setWindowWidthMinutes: createAction<number, number>(
    chartActionNames.SET_WINDOW_WIDTH_MINUTES,
    (v: number) => v
  ),
  setGraphPointsSelectionMode: createAction<EnumChartPointsSelectionMode, EnumChartPointsSelectionMode>(
    chartActionNames.SET_CHART_POINTS_SELECTION_MODE,
    (v: EnumChartPointsSelectionMode) => v
  ),
  setZoomWindowLevel: createAction<EnumZoomSelected, EnumZoomSelected>(
    chartActionNames.SET_ZOOM,
    (v: EnumZoomSelected) => v
  ),
  scrollToThePreviousFrame: createAction<void>(
    chartActionNames.SCROLL_TO_THE_PREVIOUS_FRAME,
    () => null
  ),
  scrollToTheNextFrame: createAction<void>(
    chartActionNames.SCROLL_TO_THE_NEXT_FRAME,
    () => null
  )
}
