'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

import Loading from '../../../shared/Loading';
import * as userMgmtActions from '../../actions/userMgmtActions';

class LoginPage extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired,
      user: PropTypes.object.isRequired,
      userLoaded: PropTypes.bool.isRequired,
      loginError: PropTypes.bool.isRequired,
      userMgmtActions: PropTypes.object.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = { username: '', password: '', loading: false };
    this.setUsername = this.setUsername.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.login = this.login.bind(this);
    this.onEnter = this.onEnter.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loginError) {
      this.setState(Object.assign({}, this.state, { loading: false }));
    }
  }

  setUsername(event) {
    event.preventDefault();
    this.setState(Object.assign({}, this.state,
      { username: event.target.value }));
  }

  setPassword(event) {
    event.preventDefault();
    this.setState(Object.assign({}, this.state,
      { password: event.target.value }));
  }

  login() {
    const { username, password } = this.state;
    this.props.userMgmtActions.authenticateUser({ username, password });
    this.setState(Object.assign({}, this.state, { loading: true }));
  }

  onEnter(event) {
    if (event.key === 'Enter') {
      this.login();
    }
  }

  render() {
    const { username, password, loading } = this.state;
    const { intl, loginError, userLoaded } = this.props;
    const errorMessage = loginError ? (
      <div className='ibm-item-note ibm-alert-link'>
        <FormattedMessage id='Invalid login. Please try again.' />
      </div>
    ) : null;

    if (userLoaded) {
      return (
        <Redirect to='/self-service/contracts' />
      );
    }

    return (
      <Loading hidden={!loading}
        text={intl.formatMessage({ id: 'Signing In...' })}>
        <div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <h3 className='ibm-h3'>
                <FormattedMessage id='Customer Login' />
              </h3>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1'>
              <div className='ibm-column-form'>
                <p>
                  <label><FormattedMessage id='Username' />:</label>
                  <span>
                    <input type='text'
                      className={errorMessage ? 'ibm-field-error' : ''}
                      value={username} onChange={this.setUsername} />
                  </span>
                </p>
                <p>
                  <label><FormattedMessage id='Password' />:</label>
                  <span>
                    <input type='password'
                      className={errorMessage ? 'ibm-field-error' : ''}
                      value={password} onChange={this.setPassword}
                      onKeyPress={this.onEnter} />
                  </span>
                </p>
                <p>
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
          <div className='ibm-columns'>
            <div className='ibm-col-2-1 ibm-col-medium-5-3 ibm-col-small-1-1 ibm-right'>
              <button type='button' className='ibm-btn-pri ibm-btn-blue-50'
                onClick={this.login}><FormattedMessage id='Login' /></button>
            </div>
          </div>
        </div>
      </Loading>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.userMgmt.user || {},
    userLoaded: !!state.userMgmt.user,
    loginError: state.userMgmt.user == false
  };
}

function mapDispatchToProps(dispatch) {
  return {
    userMgmtActions: bindActionCreators(userMgmtActions, dispatch)
  };
}

export default withRouter((connect(mapStateToProps, mapDispatchToProps)(
  injectIntl(LoginPage))));
