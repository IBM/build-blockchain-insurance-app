'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  FormattedMessage, FormattedDate,
  injectIntl, intlShape
} from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Link, Redirect } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import * as contractsActions from '../../actions/contractsActions';

class ContractsPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      user: PropTypes.object,
      contracts: PropTypes.array,
      contractsActions: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = { loading: true };
    if (typeof props.user === 'object') {
      props.contractsActions.loadContracts(props.user);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (Array.isArray(nextProps.contracts)) {
      this.setState({ loading: false });
    }
  }

  render() {
    const { loading } = this.state;
    const { contracts, intl, user } = this.props;

    if (!user) {
      return (
        <Redirect to='/self-service' />
      );
    }

    function showExpirationInfo(contract) {
      if (contract.void) {
        return (
          <FormattedMessage style={{ color: 'red' }} id='Contract void' />
        );
      }
      return (
        <div>
          <FormattedMessage id='Valid From' />:
          <FormattedDate value={contract.startDate} /> <br />
          <FormattedMessage id='Valid To' />:
          <FormattedDate value={contract.endDate} /> <br />
        </div>
      );
    }
    function claimButtons(contract) {
      let fileClaim = !contract.void ?
        (
          <p className='ibm-ind-link'>
            <Link className='ibm-forward-link'
              to={`/self-service/claim/${contract.uuid}`}>
              <FormattedMessage id='File a New Claim' />
            </Link>
          </p>
        ) : <FormattedMessage style={{ color: 'red' }} id='Contract void' />;

      return (
        <div>
          {fileClaim}
          <p className='ibm-ind-link'>
            <Link className='ibm-forward-link'
              to={`/self-service/contract/${contract.uuid}/claims`}>
              <FormattedMessage id='View Claims' />
              ({(contract.claims || []).length})
              </Link>
          </p>
        </div>
      );
    }

    const cards = Array.isArray(contracts) ? contracts.map(
      (contract, index) => (
        <div key={index} className='ibm-col-5-1 ibm-col-medium-6-2'>
          <div className='ibm-card ibm-border-gray-50'>
            <div className='ibm-card__content'>
              <h4 className='ibm-bold ibm-h4'>{contract.description}</h4>
              <div style={{ wordWrap: 'break-word' }}>
                <FormattedMessage id='Brand' />: {contract.item.brand}<br />
                <FormattedMessage id='Model' />: {contract.item.model}<br />
                <FormattedMessage id='Serial No.' />: {contract.item.serialNo}
                <br />
                {showExpirationInfo(contract)}
              </div>
              <br />
              {claimButtons(contract)}
            </div>
          </div>
        </div>
      )) : null;

    return (
      <Loading hidden={!loading}
        text={intl.formatMessage({ id: 'Loading Contracts...' })}>
        <div className='ibm-columns' style={{ minHeight: '6em' }}>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'><FormattedMessage id='Your Contracts' /></h3>
          </div>
          <div className='ibm-columns ibm-cards' data-widget='masonry'
            data-items='.ibm-col-5-1'>
            {cards}
          </div>
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user,
    contracts: state.contracts
  };
}

function mapDispatchToProps(dispatch) {
  return {
    contractsActions: bindActionCreators(contractsActions, dispatch)
  };
}

export default withRouter(connect(
  mapStateToProps, mapDispatchToProps)(injectIntl(ContractsPage)));
