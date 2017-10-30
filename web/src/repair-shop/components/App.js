'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';

const app = ({ children }) => {
  return (
    <div>
      <div className='ibm-columns'>
        <div className='ibm-col-1-1'>
          <h2 className='ibm-h2'>
            <FormattedMessage id='Repair Service' />
          </h2>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};

app.propTypes = {
  children: PropTypes.element.isRequired
};

export default withRouter(app);
