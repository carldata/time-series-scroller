// tslint:disable:no-string-literal
import thunk from 'redux-thunk';
import { applyMiddleware, combineReducers, compose, createStore, ReducersMapObject, Store } from 'redux';
import { IAppState, IChartsState } from './state';
import { doItYourselfContainerReducer, DoItYourselfContainerReducerActionTypes } from './reducers';
import { IHpTimeSeriesChartState } from '../../hp-time-series-chart/state';

interface ICombinedReducers extends ReducersMapObject {
  chartsState: (chartsState: IChartsState, action: DoItYourselfContainerReducerActionTypes) => IChartsState;
}

const reducerMapObject: ICombinedReducers = {
  chartsState: doItYourselfContainerReducer,
};

const combinedReducers = combineReducers<IAppState>(reducerMapObject);

// this is the callback function required in order to have this Chrome extension https://github.com/zalmoxisus/redux-devtools-extension working
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

export const doItYourselfComponentStore: Store<IAppState> = createStore(combinedReducers, composeEnhancers(applyMiddleware(thunk)));