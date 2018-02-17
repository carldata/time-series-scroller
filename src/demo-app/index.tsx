import './styles.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { hpTimeSeriesChartCsvLoadingActionCreators } from '../hp-time-series-chart/csv-loading/action-creators';
import { HashRouter, Route } from 'react-router-dom';
import { Store, createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { HpTimeSeriesChart } from '../hp-time-series-chart';
import { RealTimeTesting } from './demo-container';
import { storeCreator } from './demo-container/store-creator';

const combinedReducers = combineReducers({
  chartState: storeCreator
});

//this is the callback function required in order to have this Chrome extension https://github.com/zalmoxisus/redux-devtools-extension working
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const store: Store<any> = createStore(combinedReducers, composeEnhancers(), applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <div>
      <RealTimeTesting />
    </div>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);