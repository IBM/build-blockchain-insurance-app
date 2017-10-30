'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Link } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import * as contractTemplateActions from '../../actions/contractTemplateActions';

const ContractTemplatesPage = ({
  loading, contractTypes, intl, contractTemplateActions }) => {
  const contractTemplateRows = Array.isArray(contractTypes) ? contractTypes
    .sort((a, b) => a.description.localeCompare(b.description))
    .map((contractType, index) => (
      <tr key={index}
        ref={row => {
          jQuery(row).tooltip({
            content: `<b>Contract Terms:</b> <br />${contractType.conditions}`
          });
        }}>
        <td>{activateIcon(contractType)}</td>
        <td>{contractType.description}</td>
        <td>{formatShopTypes(contractType)}</td>
        <td><FormattedMessage id={
          contractType.theftInsured ? 'Present' : 'Not Included'} /></td>
        <td>{contractType.minDurationDays}</td>
        <td>{contractType.maxDurationDays}</td>
      </tr>
    )) : null;
  function activateIcon(contractType) {
    const activate = () => {
      contractTemplateActions.setContractTypeActive(contractType.uuid, true);
    };
    const deactivate = () => {
      contractTemplateActions.setContractTypeActive(
        contractType.uuid, false);
    };
    let activateButton = (
      <button type='button'
        className='ibm-btn-sec ibm-btn-small ibm-btn-green-50'
        style={{ marginLeft: '5px', marginRight: '5px' }}
        onClick={activate}>
        <FormattedMessage id='Activate' />
      </button>
    );
    let deactivateButton = (
      <button type='button' className='ibm-btn-sec ibm-btn-small ibm-btn-red-50'
        style={{ marginLeft: '5px', marginRight: '5px' }}
        onClick={deactivate}>
        <FormattedMessage id='Deactivate' />
      </button>
    );
    return contractType.active ? deactivateButton : activateButton;
  }
  function formatShopTypes(contractType) {
    let { shopType } = contractType;
    if (typeof shopType !== 'string') {
      return shopType;
    }
    shopType = contractType.shopType.toUpperCase();
    return shopType.split('').map(l => {
      switch (l) {
        case 'B': return intl.formatMessage({ id: 'Bike Shops' });
        case 'P': return intl.formatMessage({ id: 'Phone Shops' });
        case 'S': return intl.formatMessage({ id: 'Ski Shops' });
        default: return;
      }
    }).join(', ');
  }

  return (
    <Loading hidden={!loading}
      text={intl.formatMessage({ id: 'Loading contract types...' })}>
      <div className='ibm-columns' style={{ minHeight: '30vh' }}>
        <div className='ibm-col-1-1'>
          <h3 className='ibm-h3'>
            <FormattedMessage id='Contract Templates' />
          </h3>
        </div>
        <div style={{ marginTop: '10px', marginBottom: '20px' }}
          className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
          <Link type='button' className='ibm-btn-sec ibm-btn-blue-50'
            to='/contract-management/new-contract-template'>
            <FormattedMessage id='Create Contract Template' />
          </Link>
        </div>
        <div className='ibm-col-1-1'>
          <table className='ibm-data-table ibm-altcols'>
            <thead>
              <tr>
                <th><FormattedMessage id='Status' /></th>
                <th><FormattedMessage id='Description' /></th>
                <th><FormattedMessage id='Availability to Merchants' /></th>
                <th><FormattedMessage id='Theft Insured' /></th>
                <th><FormattedMessage id='Min. Duration (days)' /></th>
                <th><FormattedMessage id='Max. Duration (days)' /></th>
              </tr>
            </thead>
            <tbody>
              {contractTemplateRows}
            </tbody>
          </table>
        </div>
      </div>
    </Loading>
  );
};

ContractTemplatesPage.propTypes = {
  intl: intlShape.isRequired,
  contractTypes: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  contractTemplateActions: PropTypes.object.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    contractTypes: state.contractTemplates.contractTypes,
    loading: !Array.isArray(state.contractTemplates.contractTypes)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    contractTemplateActions: bindActionCreators(
      contractTemplateActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(ContractTemplatesPage)));
