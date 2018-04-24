import './styles.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { GraphScreen } from './time-series-scroller';
import { store } from './time-series-scroller/store-creator';

ReactDOM.render(
  <Provider store={store}>
    <div className="master-div">
      <GraphScreen />
    </div>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);