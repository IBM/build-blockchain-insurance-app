import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router, Route, Switch, withRouter
} from 'react-router-dom';

import App from './components/App';
import RepairOrdersPage from './components/RepairOrdersPage';
import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router basename='repair-shop'>
      <App>
        <Switch>
          <Route exact path='/' component={RepairOrdersPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}
