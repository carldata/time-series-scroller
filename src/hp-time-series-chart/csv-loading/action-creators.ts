import { createAction } from 'redux-actions';
import { Dispatch } from 'redux';
import { ICsvRawParseConfiguration, ICsvDataLoadedActionResponse } from './models';

export const actionTypes = {
  CSV_DATA_LOAD_INITIALIZE: 'CSV_DATA_LOAD_INITIALIZE',
  CSV_DATA_LOAD_FINALIZE: 'CSV_DATA_LOAD_FINALIZE'
}

/**
 * Starts asynchronous loading of CSV file
 * 1) takes as an input parameters
 * dispatchFunction: Function
 * dateRange: Date[] - date range from / to HP Time Series component should display dates
 * configuration: ICsvRawParseConfiguration - configuration indicating how to parse CSV file 
 * 
 * 1) returns in payload:
 * dateRange: Date[] - date range from / to HP Time Series component should display dates
 */  
export const csvDataLoadInitialize = createAction<Date[], Dispatch<void>, Date[], ICsvRawParseConfiguration>(
  actionTypes.CSV_DATA_LOAD_INITIALIZE,
  (dispatch: Dispatch<void>, dateRange: Date[], config: ICsvRawParseConfiguration) => {
    fetch(config.url)
      .then(response => response.text())
      .then(text => dispatch(csvDataLoadFinalize(text, config)));
    return dateRange;
  }
);

/**
 * Called when system actually holds the full text of CSV file. 
 * 
 * Used by
 * 1) external functions that pass text cont
 * 2) initializeCsvDataLoad action, when loading succeeds.
 */
export const csvDataLoadFinalize = createAction<ICsvDataLoadedActionResponse, string, ICsvRawParseConfiguration>(
  actionTypes.CSV_DATA_LOAD_FINALIZE,
  (text: string, config: ICsvRawParseConfiguration) => <ICsvDataLoadedActionResponse>{
    text: text,
    config: config
  }
)
