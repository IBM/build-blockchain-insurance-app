'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import * as contractTemplateActions from '../../actions/contractTemplateActions';

class NewContractTemplatePage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      contractTemplateActions: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      description: 'New Contract',
      bikeShop: true,
      phoneShop: false,
      skiShop: false,
      formulaPerDay: 'price * 0.001',
      maxSumInsured: 2000,
      theftInsured: true,
      conditions: 'New Contract Template Terms',
      minDurationDays: 1,
      maxDurationDays: 5
    };

    this.setField = this.setField.bind(this);
    this.createContractType = this.createContractType.bind(this);
  }

  setField(event) {
    const { name, value, checked } = event.target;
    if (!name) {
      return;
    }
    let validated;

    if (value) {
      switch (event.target) {
        case this.refs.maxSumInsuredField:
          validated = Number(value) ? value : 0;
          break;
        case this.refs.minDurationDaysField:
        case this.refs.maxDurationDaysField:
          validated = parseInt(value, 10);
          break;
        case this.refs.theftInsuredField:
        case this.refs.bikeShopField:
        case this.refs.phoneShopField:
        case this.refs.skiShopField:
          validated = checked;
          break;
        default:
          validated = value;
          break;
      }
    }
    this.setState({ [name]: validated });
  }

  createContractType() {
    const {
      description, bikeShop, phoneShop, skiShop, formulaPerDay,
      maxSumInsured, theftInsured, conditions, minDurationDays, maxDurationDays
    } = this.state;
    this.props.contractTemplateActions.createContractType({
      description,
      shopType:
      `${bikeShop ? 'B' : ''}${phoneShop ? 'P' : ''}${skiShop ? 'S' : ''}`,
      formulaPerDay,
      maxSumInsured,
      theftInsured,
      conditions,
      minDurationDays,
      maxDurationDays,
      active: true
    });
    this.props.history.push('/contract-management');
  }

  render() {
    const {
      description, bikeShop, phoneShop, skiShop, formulaPerDay,
      maxSumInsured, theftInsured, conditions, minDurationDays, maxDurationDays
    } = this.state;

    return (
      <div>
        <div className='ibm-columns'>
          <div className='ibm-col-1-1'>
            <h3 className='ibm-h3'>
              <FormattedMessage id='New Contract Template' />
            </h3>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1  ibm-col-medium-5-3 ibm-col-small-1-1'>
            <div className='ibm-column-form'>
              <p>
                <label><FormattedMessage id='Description' />:</label>
                <span>
                  <input type='text'
                    ref='descriptionField' name='description'
                    value={description} onChange={this.setField} />
                </span>
              </p>
              <p className='ibm-form-elem-grp'>
                <label>
                  <FormattedMessage id='Availability to Merchants' />:
                </label>
                <span className='ibm-input-group'>
                  <span>
                    <input type='checkbox' className='ibm-styled-checkbox'
                      id='bikeShopField' ref='bikeShopField' name='bikeShop'
                      checked={bikeShop} onChange={this.setField} />
                    <label className='ibm-field-label' htmlFor='bikeShopField'>
                      <FormattedMessage id='Bike Shops' />
                    </label>
                  </span>
                  <br />
                  <span>
                    <input type='checkbox' className='ibm-styled-checkbox'
                      id='phoneShopField' ref='phoneShopField' name='phoneShop'
                      checked={phoneShop} onChange={this.setField} />
                    <label className='ibm-field-label' htmlFor='phoneShopField'>
                      <FormattedMessage id='Phone Shops' />
                    </label>
                  </span>
                  <br />
                  <span>
                    <input type='checkbox' className='ibm-styled-checkbox'
                      id='skiShopField' ref='skiShopField' name='skiShop'
                      checked={skiShop} onChange={this.setField} />
                    <label className='ibm-field-label' htmlFor='skiShopField'>
                      <FormattedMessage id='Ski Shops' />
                    </label>
                  </span>
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Formula Per Day' />:</label>
                <span>
                  <input type='text'
                    ref='formulaPerDayField' name='formulaPerDay'
                    value={formulaPerDay} onChange={this.setField} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Max. Sum Insured' />:</label>
                <span>
                  <input type='text'
                    ref='maxSumInsuredField' name='maxSumInsured'
                    value={maxSumInsured} onChange={this.setField} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Terms and Conditions' />:</label>
                <span>
                  <textarea type='text'
                    ref='conditionsField' name='conditions'
                    value={conditions} onChange={this.setField} />
                </span>
              </p>
              <p className='ibm-form-elem-grp'>
                <label><FormattedMessage id='Theft Insured' />:</label>
                <span className='ibm-input-group'>
                  <input type='checkbox' className='ibm-styled-checkbox'
                    id='theftInsuredField' ref='theftInsuredField'
                    name='theftInsured'
                    checked={theftInsured} onChange={this.setField} />
                  <label className='ibm-field-label'
                    htmlFor='theftInsuredField' />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Min. Duration (days)' />:</label>
                <span>
                  <input type='text'
                    ref='minDurationDaysField' name='minDurationDays'
                    value={minDurationDays} onChange={this.setField} />
                </span>
              </p>
              <p>
                <label><FormattedMessage id='Max. Duration (days)' />:</label>
                <span>
                  <input type='text'
                    ref='maxDurationDaysField' name='maxDurationDays'
                    value={maxDurationDays} onChange={this.setField} />
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className='ibm-columns'>
          <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
            <button type='button' className='ibm-btn-pri ibm-btn-blue-50'
              onClick={this.createContractType}>
              <FormattedMessage id='Create' />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    contractTemplateActions: bindActionCreators(
      contractTemplateActions, dispatch)
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(NewContractTemplatePage)));
