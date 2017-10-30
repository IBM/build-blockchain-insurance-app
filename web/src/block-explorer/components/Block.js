'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import Transaction from './Transaction';

const Block = ({ data }) => {
  return (
    <div className='block'>
      <div className='block-data'>
        <p>
          <b><FormattedMessage id='Block No.' />:</b> {data.id}
        </p>
        <p>
          <b><FormattedMessage id='Hash' />:</b>&nbsp;
        <code>{data.fingerprint.substr(0, 10)}</code>
        </p>
        <p>
          <b><FormattedMessage id='Transactions' />:</b>&nbsp;
          {data.transactions.length}
        </p>
        <div className='transactions'>
          {data.transactions.map((t, i) => <Transaction key={i} data={t} />)}
        </div>
      </div>
    </div>
  );
};

Block.propTypes = {
  data: PropTypes.object.isRequired
};

export default injectIntl(Block);
