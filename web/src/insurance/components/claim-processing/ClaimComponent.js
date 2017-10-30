import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';

class ClaimComponent extends React.Component {

  static get propTypes() {
    return {
      claim: PropTypes.object.isRequired,
      onRepair: PropTypes.func.isRequired,
      onReimburse: PropTypes.func.isRequired,
      onReject: PropTypes.func.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = { reimbursable: 0 };
    this.setReimbursable = this.setReimbursable.bind(this);
    this.repair = this.repair.bind(this);
    this.reimburse = this.reimburse.bind(this);
    this.reject = this.reject.bind(this);
  }

  setReimbursable(e) {
    let { value } = e.target;
    if (value) {
      value = Number(value) ? value : 0;
    }
    this.setState({ reimbursable: value });
  }

  repair() {
    const { onRepair } = this.props;
    onRepair();
  }

  reimburse() {
    const { onReimburse } = this.props;
    const { reimbursable } = this.state;
    onReimburse(Number(reimbursable));
  }

  reject() {
    const { onReject } = this.props;
    onReject();
  }

  render() {
    const { claim } = this.props;
    const { reimbursable } = this.state;

    const claimButtons = c => {
      const repairButton = c.isTheft ? null : (
        <button key='repairButton' type='button'
          className='ibm-btn-sec ibm-btn-small ibm-btn-blue-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.repair}>
          <FormattedMessage id='Repair' />
        </button>
      );
      const reimburseButton = c.isTheft && c.status !== 'P' ? null : (
        <button key='reimburseButton' type='button'
          className='ibm-btn-sec ibm-btn-small ibm-btn-teal-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.reimburse}>
          <FormattedMessage id='Reimburse' />
        </button>
      );
      const rejectButton = (
        <button key='rejectButton' type='button'
          className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
          style={{ marginLeft: '15px', marginRight: '15px' }}
          onClick={this.reject}>
          <FormattedMessage id='Reject' />
        </button>
      );
      return (
        <div>
          {[repairButton, reimburseButton, rejectButton]}
        </div>
      );
    };

    return (
      <div className='ibm-col-2-1 ibm-col-medium-2-1 ibm-col-small-1-1'>
        <div className='ibm-card ibm-border-gray-50'>
          <div className='ibm-card__content'>
            <h4 className='ibm-bold ibm-h4'>{claim.description}</h4>
            <div style={{ wordWrap: 'break-word' }} className='ibm-column-form'>
              <p>
                <label><FormattedMessage id='Description' />: </label>
                <span>{claim.description}</span>
              </p>
              <p>
                <label><FormattedMessage id='Creation Date' />: </label>
                <span><FormattedDate value={claim.date} /></span>
              </p>
              <p>
                <label><FormattedMessage id='Theft Involved' />: </label>
                <span className='ibm-input-group'>
                  <input type='checkbox' className='ibm-styled-checkbox'
                    ref='theftField' checked={claim.isTheft}
                    readOnly disabled />
                  <label className='ibm-field-label' htmlFor='theftField' />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Reimbursable' />: </label>
                <span>
                  <input type='text'
                    value={reimbursable} onChange={this.setReimbursable} />
                </span>
              </p>
            </div>
            {claimButtons(claim)}
          </div>
        </div>
      </div>
    );
  }
}

export default ClaimComponent;
