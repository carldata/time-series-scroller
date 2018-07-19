import './styles.scss';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { DoItYourselfDemo } from './do-it-yourself';
import { doItYourselfComponentStore } from './do-it-yourself/store-creator';

ReactDOM.render(
  <Provider store={doItYourselfComponentStore}>
    <div className="master-div">
      <DoItYourselfDemo />
    </div>
  </Provider>,
  document.body.appendChild(document.createElement('div'))
);