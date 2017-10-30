'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import {
  FormattedMessage, FormattedDate,
  injectIntl, intlShape
} from 'react-intl';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import ClaimComponent from './ClaimComponent';
import * as claimProcessingActions from '../../actions/claimProcessingActions';

class ClaimsPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      claims: PropTypes.array,
      loading: PropTypes.bool.isRequired,
      claimProcessingActions: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    const { loading, intl, claimProcessingActions, claims } = this.props;

    const cards = Array.isArray(claims) ? claims
      .sort((a, b) => a.uuid.localeCompare(b.uuid))
      .map(claim => {
        const repair = () => {
          claimProcessingActions.processClaim(
            claim.contractUuid, claim.uuid, 'R', 0);
        };
        const reimburse = (reimbursable) => {
          claimProcessingActions.processClaim(
            claim.contractUuid, claim.uuid, 'F', reimbursable);
        };
        const reject = () => {
          claimProcessingActions.processClaim(
            claim.contractUuid, claim.uuid, 'J', 0);
        };
        return (
          <ClaimComponent key={claim.uuid} claim={claim}
            onRepair={repair}
            onReimburse={reimburse}
            onReject={reject} />
        );
      }) : null;
    const claimsDisplay = ((Array.isArray(cards) && cards.length > 0) ||
      cards === null) ? cards :
      (
        <div className='ibm-col-5-5 ibm-col-medium-6-6'>
          <FormattedMessage id='No outstanding claims.' />
        </div>
      );

    return (
      <Loading hidden={!loading}
        text={intl.formatMessage({ id: 'Loading Claims...' })}>
        <div>
          <div className='ibm-columns'>
            <div className='ibm-col-5-5 ibm-col-medium-6-6'>
              <h3 className='ibm-h3'>
                <FormattedMessage id='Unprocessed Claims' />
              </h3>
            </div>
          </div>
          <div className='ibm-columns ibm-cards' style={{ minHeight: '30vh' }}
            data-widget='masonry' data-items='.ibm-col-2-1'>
            {claimsDisplay}
          </div>
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    claims: state.claimProcessing.claims,
    loading: !Array.isArray(state.claimProcessing.claims)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    claimProcessingActions: bindActionCreators(claimProcessingActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(ClaimsPage)));
