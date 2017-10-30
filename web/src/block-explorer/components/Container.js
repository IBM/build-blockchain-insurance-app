/*global io*/
'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import naturalSort from 'javascript-natural-sort';
import { Socket } from 'engine.io-client';

import * as Api from '../api';
import Block from './Block';
import Loading from '../../shared/Loading';

const MAX_BLOCK_COUNT = 5;
const BLOCK_EXPLORER_HIDDEN = 'block-explorer:hidden';
const storeItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const retrieveItem = (key, def) => {
  const item = localStorage.getItem(key);
  return item === null ? def : JSON.parse(item);
};
class Container extends React.Component {

  static get propTypes() {
    return {
      intl: intlShape.isRequired
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      blocks: null,
      hidden: retrieveItem(BLOCK_EXPLORER_HIDDEN, true),
      hintHidden: true
    };

    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.showHint = this.showHint.bind(this);
    this.hideHint = this.hideHint.bind(this);

    setTimeout(async () => {
      const socket = io('/insurance');  // Getting all events from the Insurance
      let blocks = await Api.getBlocksFromContractManagement(MAX_BLOCK_COUNT);
      socket.on('block', block => {
        console.log(block);
        this.setState({ blocks: [...this.state.blocks, block] });
      });
      blocks = Array.isArray(blocks) ? blocks : [];
      this.setState({ blocks });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    storeItem(BLOCK_EXPLORER_HIDDEN, this.state.hidden);
  }

  toggleVisibility() {
    this.setState({ hidden: !this.state.hidden });
  }

  showHint() {
    this.setState({ hintHidden: false });
  }

  hideHint() {
    this.setState({ hintHidden: true });
  }

  setState(state) {
    const { blocks } = state;
    // Sort the blocks by id
    if (Array.isArray(state.blocks)) {
      state.blocks = state.blocks.sort((a, b) => naturalSort(a.id, b.id));
      if (blocks.length > MAX_BLOCK_COUNT) {
        // Top the amount of blocks to be displayed
        state.blocks = blocks.slice(-MAX_BLOCK_COUNT);
      }
    }
    return super.setState(...arguments);
  }

  render() {
    const { blocks, hidden, hintHidden } = this.state;
    const { intl } = this.props;

    const explorerMessage = hidden ? 'Show Explorer' : 'Close Explorer';
    const explorerIcon = hidden ? '/img/icons/maximize_24.svg' :
      '/img/icons/minimize_24.svg';
    const blocksDisplay = !hidden ?
      (<Loading hidden={Array.isArray(blocks)}
        text={intl.formatMessage({ id: 'Loading Blocks...' })}>
        <div>
          {Array.isArray(blocks) ?
            blocks.map(block => <Block key={block.id} data={block} />) :
            null}
        </div>
      </Loading>) :
      null;
    return (
      <div className='block-explorer'>
        <div className={`toggle-visibility-button${hidden ? ' hidden' : ''}`}>
          <div className={`hint ${hintHidden ? 'hidden' : ''}`}>
            {intl.formatMessage({ id: explorerMessage })}
          </div>
          <div onMouseLeave={this.hideHint} onMouseEnter={this.showHint}
            onClick={this.toggleVisibility}>
            <img src={explorerIcon} />
          </div>
        </div>
        <div className={`contents${hidden ? ' hidden' : ''}`}
          style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', textAlign: 'initial', height: '100%'
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              height: '100%'
            }}>
              <div>
                <h2 className='ibm-h2'
                  style={{ paddingTop: '10px', paddingLeft: '10px' }}>
                  <FormattedMessage id='Block Explorer' />
                </h2>
              </div>
              <div style={{ flex: 'auto' }}>
                <div style={{ height: '100%', width: '100%' }}>
                  {blocksDisplay}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

export default injectIntl(Container);
