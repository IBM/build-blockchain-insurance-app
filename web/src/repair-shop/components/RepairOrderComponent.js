'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class RepairOrderComponent extends React.Component {

  static get propTypes() {
    return {
      repairOrder: PropTypes.object.isRequired,
      onMarkedComplete: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.markComplete = this.markComplete.bind(this);
  }

  markComplete() {
    const { repairOrder, onMarkedComplete } = this.props;
    if (typeof onMarkedComplete === 'function') {
      setTimeout(() => { onMarkedComplete(repairOrder.uuid); });
    }
  }

  render() {
    const { repairOrder } = this.props;

    return (
      <div className='ibm-col-5-1 ibm-col-medium-6-2'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>
              <FormattedMessage id='Repair Order' />
            </h4>
            <div style={{ wordWrap: 'break-word' }}>
              <p>
                <FormattedMessage id='Brand' />:
                  {repairOrder.item.brand} <br />
                <FormattedMessage id='Model' />:
                  {repairOrder.item.model} <br />
                <FormattedMessage id='Description' />:
                  {repairOrder.item.description} <br />
              </p>
              <p>
                <button type='button'
                  className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
                  onClick={this.markComplete}>
                  <FormattedMessage id='Mark Completed' />
                </button>
              </p>
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}

export default RepairOrderComponent;
