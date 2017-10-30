/*eslint react/no-danger: "off"*/
'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';

class ProductCarousel extends React.Component {

  static get propTypes() {
    return {
      products: PropTypes.array.isRequired,
      selectedProductIndex: PropTypes.number,
      onSelectedProduct: PropTypes.func
    };
  }

  constructor(props) {
    super(props);

    let state = {
      selected: null
    };
    if (typeof props.selectedProductIndex === 'number') {
      state.selected = props.products[props.selectedProductIndex];
    }
    this.state = state;
    this.carouselItem = this.carouselItem.bind(this);
    this.onSlideChanged = this.onSlideChanged.bind(this);
  }

  componentWillMount() {
    // Preselecting the first one, if nothing is selected
    if (!this.state.selected) {
      let firstProduct = this.props.products[0];
      if (firstProduct) {
        this.onSelectedProduct(firstProduct);
      }
    }
  }

  componentDidMount() {
    let elem = jQuery(this.refs.carouselElement);
    elem.carousel({
      autoplay: false
    });
    elem.on('afterChange', this.onSlideChanged);
  }

  componentWillUnmount() {
    let elem = jQuery(this.refs.carouselElement);
    elem.off('afterChange', this.onSlideChanged);
  }

  onSelectedProduct(product) {
    if (!product) {
      return;
    }
    this.setState({ selected: product });
    if (!this.props.onSelectedProduct) {
      return;
    }
    this.props.onSelectedProduct({
      index: this.props.products.indexOf(product),
      brand: product.brand,
      model: product.model,
      price: product.price
    });
  }

  onSlideChanged(event) {
    if (event.type == 'afterChange') {
      let activeSlide = jQuery(this.refs.carouselElement)
        .find('.slick-current.slick-active');
      let index = Number(activeSlide.attr('data-slick-index'));
      this.onSelectedProduct(this.props.products[index]);
    }
  }

  carouselItem(product, index) {
    let isActive = this.selected === product;
    return (
      <div key={index} className={`${isActive ? ' is-active' : ''}`}>
        <p><img src={product.imgSrc} /></p>
        <p dangerouslySetInnerHTML={{ __html: product.description }} />
      </div>
    );
  }

  render() {
    return (
      <div ref='carouselElement'>
        {this.props.products.map(this.carouselItem)}
      </div>
    );
  }
}

export default ProductCarousel;
