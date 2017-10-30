/*global IBMCore*/
'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';
import 'moment/locale/de';

class DateInput extends React.Component {

  static get propTypes() {
    return {
      onChange: PropTypes.func,
      value: PropTypes.number,
      intl: intlShape.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    IBMCore.common.widget.datepicker.init(this.refs.dateInputElement, {});
    let self = this;
    setTimeout(() => {
      self.picker = jQuery(this.refs.dateInputElement).pickadate('picker');
      self.picker.on('set', self.onChange);
    }, 500);
  }

  componentWillUnmount() {
    this.picker.off('set', this.onChange);
  }

  onChange(value) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value.select);
    }
  }

  render() {
    let formattedDate;
    if (this.props.value && this.props.value > 0) {
      formattedDate = moment(new Date(this.props.value)).format('L', this.props.intl.locale);
    }
    return (
      <input type='text' readOnly ref='dateInputElement' value={formattedDate} />
    );
  }
}

export default injectIntl(DateInput);
