'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage, FormattedDate, FormattedNumber,
  injectIntl, intlShape
} from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

class ContractClaimsPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      user: PropTypes.object,
      contracts: PropTypes.array.isRequired,
      match: PropTypes.shape({
        params: PropTypes.shape({
          contractUuid: PropTypes.string.isRequired
        })
      }).isRequired
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { contracts, intl, user } = this.props;
    const { contractUuid } = this.props.match.params;

    const { claims } = Array.isArray(contracts) ?
      contracts.find(c => c.uuid == contractUuid) || {} : {};

    if (!user) {
      return (
        <Redirect to='/self-service' />
      );
    }

    function formatStatus(claim) {
      if (!claim) {
        return null;
      }
      let message, messageId, reimbursable;
      switch (claim.status) {
        case 'N':
          messageId = claim.isTheft ? 'Expecting confirmation from police'
            : 'Being Processed';
          break;
        case 'R':
          messageId = claim.repaired ? 'Repaired' : 'To be repaired';
          break;
        case 'F':
          messageId = 'Reimbursement';
          reimbursable = <span>
            , <FormattedNumber style='currency'
              currency={intl.formatMessage({ id: 'currency code' })}
              value={claim.reimbursable} minimumFractionDigits={2} />
          </span>;
          break;
        case 'P':
          messageId = 'Theft confirmed by police';
          break;
        case 'J':
          messageId = 'Rejected';
          break;
        default:
          messageId = 'Unknown';
      }
      if (messageId) {
        message = <FormattedMessage id={messageId} />;
      }
      let fileReference;
      if (claim.isTheft && claim.fileReference) {
        fileReference = (
          <span>
            , <FormattedMessage id='File Reference' />: {claim.fileReference}
          </span>
        );
      }
      return (
        <span>{message}{fileReference}{reimbursable}</span>
      );
    }
    const cards = Array.isArray(claims) ? claims.map((claim, index) => (
      <div key={index} className='ibm-col-5-2 ibm-col-medium-6-2'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>{claim.description}</h4>
            <div style={{ wordWrap: 'break-word' }}>
              <FormattedMessage id='Creation Date' />:
              <FormattedDate value={claim.date} /> <br />
              <FormattedMessage id='Theft' />:
              <input type='checkbox' ref='theftField'
                className='ibm-styled-checkbox' checked={claim.isTheft} />
              <label className='ibm-field-label' htmlFor='theftField' /><br />
              <FormattedMessage id='Description' />: {claim.description}<br />
              <FormattedMessage id='Status' />: {formatStatus(claim)}
            </div>
            <br />
          </div>
        </div>
      </div>
    )) : (
        <div className='ibm-col-5-5 ibm-col-medium-6-6'>
          <FormattedMessage id={`You haven't filed any claims yet.`} />
        </div>
      );
    return (
      <div style={{ minHeight: '30vh' }}>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
            <h3 className='ibm-h3'>
              <FormattedMessage id='Claims to Selected Contract' />
            </h3>
          </div>
        </div>
        <div className='ibm-columns ibm-cards' data-widget='masonry'
          data-items='.ibm-col-5-1'>
          {cards}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user,
    contracts: state.contracts
  };
}

export default withRouter(connect(mapStateToProps)(
  injectIntl(ContractClaimsPage)));
