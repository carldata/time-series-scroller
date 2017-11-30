import * as React from 'react';
import * as ReactDOM from 'react-dom';
import thunk from 'redux-thunk';
import { HashRouter, Route } from 'react-router-dom';
import { Store, createStore, compose, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { HpTimeSeriesChart } from './hpTimeSeriesChart/index';
import { reducers } from './hpTimeSeriesChart/common/reducers';

const combinedReducers = combineReducers({
  chartState: reducers.buildInitialState
});

//this is the callback function required in order to have this Chrome extension https://github.com/zalmoxisus/redux-devtools-extension working
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const store: Store<any> = createStore(combinedReducers, composeEnhancers(), applyMiddleware(thunk));

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <span>
        <h1>Hello World !</h1>
      </span>
    </HashRouter>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);