'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';

class SelectList extends React.Component {

  static get propTypes() {
    return {
      options: PropTypes.array.isRequired,
      getCaptionFunc: PropTypes.func.isRequired,
      onChange: PropTypes.func,
      selectedItemIndex: PropTypes.number
    };
  }

  constructor(props) {
    super(props);

    const selectedItemIndex = props.selectedItemIndex || 0; // Fallback to the first
    this.state = { selectedItemIndex };

    this.optionItem = this.optionItem.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    let elem = jQuery(this.refs.selectElement);
    elem.select2();
    elem.on('change', this.onChange);
  }

  componentWillUnmount() {
    jQuery(this.refs.selectElement).off('change', this.onChange);
  }

  onChange() {
    const selectedItemIndex = Number(jQuery(this.refs.selectElement).val());
    this.setState({ selectedItemIndex });
    setTimeout(() => {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this.props.options[selectedItemIndex]);
      }
    });
  }

  optionItem(data, index) {
    return (
      <option key={index} value={index}>{this.props.getCaptionFunc(data)}</option>
    );
  }

  render() {
    const { options } = this.props;
    return (
      <select ref='selectElement' readOnly value={this.state.selectedItemIndex}>
        {this.props.options.map(this.optionItem)}
      </select>
    );
  }
}

export default SelectList;



