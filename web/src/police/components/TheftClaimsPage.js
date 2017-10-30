'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Loading from '../../shared/Loading';
import * as policeActions from '../actions/policeActions';
import TheftClaimComponent from './TheftClaimComponent';

class TheftClaimsPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      theftClaims: PropTypes.array,
      loading: PropTypes.bool.isRequired,
      policeActions: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.toTheftClaimComponent = this.toTheftClaimComponent.bind(this);
  }

  toTheftClaimComponent(theftClaim, index) {
    return (
      <TheftClaimComponent key={index} theftClaim={theftClaim}
        onProcessedClaim={this.props.policeActions.processTheftClaim} />
    );
  }

  render() {
    const { theftClaims, loading, intl } = this.props;

    const cards = Array.isArray(theftClaims) ?
      theftClaims.map(this.toTheftClaimComponent) : null;
    const claims = ((Array.isArray(cards) && cards.length > 0) ||
      cards === null) ? cards :
      (
        <div className='ibm-col-5-5 ibm-col-medium-6-6'>
          <FormattedMessage id='No outstanding theft claims.' />
        </div>
      );
    return (
      <Loading hidden={loading}
        text={intl.formatMessage({ id: 'Loading Theft Claims...' })}>
        <div className='ibm-columns ibm-cards' style={{ minHeight: '30vh' }}
          data-widget='masonry' data-items='.ibm-col-6-2'>
          {claims}
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    theftClaims: state.police.theftClaims,
    loading: Array.isArray(state.police.theftClaims)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    policeActions: bindActionCreators(policeActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(TheftClaimsPage));
