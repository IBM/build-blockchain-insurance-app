'use strict';

import React from 'react';
import { FormattedMessage } from 'react-intl';

const NotFoundPage = () => {
  return (
    <div className='row'>
      <div className='small-12 columns'>
        <h3 style={{ color: 'red' }}>
          <FormattedMessage id='Page Not Found!' />
        </h3>
      </div>
    </div>
  );
};

export default NotFoundPage;
