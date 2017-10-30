'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import Loading from '../../shared/Loading';
import * as repairShopActions from '../actions/repairShopActions';
import RepairOrderComponent from './RepairOrderComponent';

class RepairOrdersPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      repairOrders: PropTypes.array,
      loading: PropTypes.bool.isRequired,
      repairShopActions: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.toRepairOrderComponent = this.toRepairOrderComponent.bind(this);
  }

  toRepairOrderComponent(repairOrder, index) {
    return (
      <RepairOrderComponent key={index} repairOrder={repairOrder}
        onMarkedComplete={this.props.repairShopActions.completeRepairOrder} />
    );
  }

  render() {
    const { repairOrders, loading, intl } = this.props;

    const cards = Array.isArray(repairOrders) ?
      repairOrders.map(this.toRepairOrderComponent) : null;
    const orders = ((Array.isArray(cards) && cards.length > 0) ||
      cards === null) ? cards :
      (
        <div className='ibm-col-5-5 ibm-col-medium-6-6'>
          <FormattedMessage id='No outstanding repair orders.' />
        </div>
      );
    return (
      <Loading hidden={loading}
        text={intl.formatMessage({ id: 'Loading Repair Orders...' })}>
        <div className='ibm-columns ibm-cards' style={{ minHeight: '30vh' }}
          data-widget='masonry' data-items='.ibm-col-5-1'>
          {orders}
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    repairOrders: state.repairShop.repairOrders,
    loading: Array.isArray(state.repairShop.repairOrders)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    repairShopActions: bindActionCreators(repairShopActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(RepairOrdersPage)));
