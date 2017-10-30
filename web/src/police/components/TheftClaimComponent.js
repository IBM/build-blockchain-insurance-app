'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

class TheftClaimComponent extends React.Component {

  static get propTypes() {
    return {
      theftClaim: PropTypes.object.isRequired,
      onProcessedClaim: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      fileReference: ''
    };

    this.confirmClaim = this.confirmClaim.bind(this);
    this.rejectClaim = this.rejectClaim.bind(this);
    this.processClaim = this.processClaim.bind(this);
    this.setFileReference = this.setFileReference.bind(this);
  }

  setFileReference(e) {
    const { value } = e.target;
    this.setState({ fileReference: value.toUpperCase() });
  }

  confirmClaim() {
    this.processClaim(true);
  }

  rejectClaim() {
    this.processClaim(false);
  }

  processClaim(isTheft) {
    const { theftClaim, onProcessedClaim } = this.props;
    const { fileReference } = this.state;
    if (typeof onProcessedClaim === 'function') {
      setTimeout(() => {
        onProcessedClaim({
          uuid: theftClaim.uuid,
          contractUuid: theftClaim.contractUuid,
          isTheft,
          fileReference
        });
      });
    }
  }

  render() {
    const { theftClaim } = this.props;
    const { fileReference } = this.state;
    return (
      <div className='ibm-col-6-2 ibm-col-medium-2-1 ibm-col-small-1-1'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>
              <FormattedMessage id='Theft Claim' />
            </h4>
            <div className='ibm-column-form' style={{ wordWrap: 'break-word' }}>
              <p>
                <label><FormattedMessage id='Name' />:</label>
                <span>{theftClaim.name}</span>
              </p>
              <p>
                <label><FormattedMessage id='Brand' />:</label>
                <span>{theftClaim.item.brand}</span>
              </p>
              <p>
                <label><FormattedMessage id='Model' />:</label>
                <span>{theftClaim.item.model}</span>
              </p>
              <p>
                <label><FormattedMessage id='Serial No.' />:</label>
                <span>{theftClaim.item.serialNo}</span>
              </p>
              <p>
                <label><FormattedMessage id='Description' />:</label>
                <span>{theftClaim.description}</span>
              </p>
              <p>
                <label><FormattedMessage id='File Reference' />:</label>
                <span>
                  <input type='text'
                    value={fileReference} onChange={this.setFileReference} />
                </span>
              </p>
              <div>
                <button type='button'
                  className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
                  style={{ marginLeft: '15px', marginRight: '15px' }}
                  onClick={this.confirmClaim}>
                  <FormattedMessage id='Confirm' />
                </button>
                <button type='button'
                  className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
                  style={{ marginLeft: '15px', marginRight: '15px' }}
                  onClick={this.rejectClaim}>
                  <FormattedMessage id='Reject' />
                </button>
              </div>
            </div>
            <br />
          </div>
        </div>
      </div>
    );
  }
}

export default TheftClaimComponent;
