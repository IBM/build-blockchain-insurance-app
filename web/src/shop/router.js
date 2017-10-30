import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter as Router,
  Route, Switch, withRouter
} from 'react-router-dom';

import App from './components/App';
import ChooseProductPage from './components/ChooseProductPage';
import ChooseInsurancePage from './components/ChooseInsurancePage';
import PaymentPage from './components/PaymentPage';
import SummaryPage from './components/SummaryPage';
import NotFoundPage from '../shared/NotFoundPage';

function router({ shopType }) {
  return (
    <Router basename={`/shop/${shopType}`}>
      <App>
        <Switch>
          <Route exact path='/' component={ChooseProductPage} />
          <Route path='/insurance' component={ChooseInsurancePage} />
          <Route path='/payment' component={PaymentPage} />
          <Route path='/summary' component={SummaryPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}

router.propTypes = {
  shopType: PropTypes.string
};

export default router;
