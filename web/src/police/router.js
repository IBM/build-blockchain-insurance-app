import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import App from './components/App';
import TheftClaimsPage from './components/TheftClaimsPage';

import NotFoundPage from '../shared/NotFoundPage';

export default function router() {
  return (
    <Router basename='/police'>
      <App>
        <Switch>
          <Route exact path='/' component={TheftClaimsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}
