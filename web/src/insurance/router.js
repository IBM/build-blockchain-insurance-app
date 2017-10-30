import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import App from './components/App';
import NotFoundPage from '../shared/NotFoundPage';

import SelfServiceApp from './components/self-service/App';
import LoginPage from './components/self-service/LoginPage';
import ClaimPage from './components/self-service/ClaimPage';
import ContractClaimsPage from './components/self-service/ContractClaimsPage';
import ContractsPage from './components/self-service/ContractsPage';

import ClaimsPage from './components/claim-processing/ClaimsPage';

import ContractManagementApp from './components/contract-management/App';
import ContractTemplatesPage
  from './components/contract-management/ContractTemplatesPage';
import NewContractTemplatePage
  from './components/contract-management/NewContractTemplatePage';

export default function router() {
  return (
    <Router basename='/insurance'>
      <App>
        <Switch>

          {/* Claim Self-Service */}
          <Route path='/self-service'>
            <SelfServiceApp>
              <Switch>
                <Route exact path='/self-service' component={LoginPage} />
                <Route path='/self-service/contracts'
                  component={ContractsPage} />
                <Route path='/self-service/contract/:contractUuid/claims'
                  component={ContractClaimsPage} />
                <Route path='/self-service/claim/:contractUuid'
                  component={ClaimPage} />
                <Route component={NotFoundPage} />
              </Switch>
            </SelfServiceApp>
          </Route>

          {/* Claim Processing */}
          <Route exact path='/claim-processing' component={ClaimsPage} />

          {/* Contract Management */}
          <Route path='/contract-management'>
            <ContractManagementApp>
              <Switch>
                <Route exact path='/contract-management'
                  component={ContractTemplatesPage} />
                <Route path='/contract-management/new-contract-template'
                  component={NewContractTemplatePage} />
                <Route component={NotFoundPage} />
              </Switch>
            </ContractManagementApp>
          </Route>
          <Route component={NotFoundPage} />
        </Switch>
      </App>
    </Router>
  );
}
