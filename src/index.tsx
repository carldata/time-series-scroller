import * as React from 'react';
import * as ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { HashRouter, Route } from 'react-router-dom';
import { Store, createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { HpTimeSeriesChart } from './hpTimeSeriesChart/index';
import { RealTimeTesting } from './test-component/index';
import { testComponentReducer } from './test-component/reducer';

const combinedReducers = combineReducers({
  chartState: testComponentReducer
});

//this is the callback function required in order to have this Chrome extension https://github.com/zalmoxisus/redux-devtools-extension working
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const store: Store<any> = createStore(combinedReducers, composeEnhancers(), applyMiddleware(thunk));

console.log(store);

ReactDOM.render(
  <Provider store={store}>
    <RealTimeTesting />
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);