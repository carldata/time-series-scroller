/**
 * Declares reusable actions that can be used by screen using this component  
 */
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { createAction, Action } from 'redux-actions';
import { Dispatch } from 'redux';
import * as collections from 'typescript-collections';
import { Dictionary } from 'typescript-collections';
import { EnumZoomSelected } from './state/enums';
import { ICsvDataLoadedContext } from './csv-loading/models';

export const hpTimeSeriesChartActionTypes = {
  SET_CHART_WIDTH: 'SET_CHART_WIDTH',
  GENERATE_RANDOM_DATA: 'GENERATE_RANDOM_DATA',
  SET_EVENTS: 'SET_EVENTS',
  SET_WINDOW_UNIX_FROM_TO: 'SET_WINDOW_UNIX_FROM_TO',
  SET_WINDOW_WIDTH_MINUTES: 'SET_WINDOW_WIDTH_MINUTES',
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
export const hpTimeSeriesChartActionCreators = {
  generateRandomData: createAction<Date[], Date[]>(
    hpTimeSeriesChartActionTypes.GENERATE_RANDOM_DATA,
    (dates: Date[]) => dates
  ),
  setChartWidth: createAction<number, number>(
    hpTimeSeriesChartActionTypes.SET_CHART_WIDTH,
    n => n
  ),
  setEvents: createAction<collections.Dictionary<number, boolean>, number[]>(
    hpTimeSeriesChartActionTypes.SET_EVENTS,
    (unixDatesContainingEvents: number[]) => {
      let result = new collections.Dictionary<number, boolean>();
      _.each(unixDatesContainingEvents, el => result.setValue(el, true));
      return result;
    }
  ), 
  setWindowUnixFromTo: createAction<number[], number, number>(
    hpTimeSeriesChartActionTypes.SET_WINDOW_UNIX_FROM_TO,
    (unixFrom: number, unixTo: number) => [unixFrom, unixTo]
  ),
  setWindowWidthMinutes: createAction<number, number>(
    hpTimeSeriesChartActionTypes.SET_WINDOW_WIDTH_MINUTES,
    (v: number) => v
  ),
  setZoomWindowLevel: createAction<[EnumZoomSelected, number], EnumZoomSelected, number>(
    hpTimeSeriesChartActionTypes.SET_ZOOM,
    (zoom: EnumZoomSelected, widthPx: number) => [zoom, widthPx]
  ),
  scrollToThePreviousFrame: createAction<void>(
    hpTimeSeriesChartActionTypes.SCROLL_TO_THE_PREVIOUS_FRAME,
    () => null
  ),
  scrollToTheNextFrame: createAction<void>(
    hpTimeSeriesChartActionTypes.SCROLL_TO_THE_NEXT_FRAME,
    () => null
  )
}
