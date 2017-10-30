'use strict';

import React, { Props } from 'react';
import PropTypes from 'prop-types';

const Loading = ({ hidden, text, children }) => {
  if (hidden) {
    return <div>{children}</div>;
  }
  return (
    <div style={{ position: 'relative', cursor: 'progress', height: '100%' }}>
      <div style={{
        textAlign: 'center', position: 'absolute',
        top: '50%', left: '50%', width: '100%',
        transform: 'translate(-50%, -50%)', zIndex: '100'
      }}>
        <div>
          <p>
            <span className='ibm-h1 ibm-spinner' />
          </p>
          <p>{text}</p>
        </div>
      </div>
      <div style={{ filter: 'blur(2px)' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%' }} />
        {children}
      </div>
    </div>
  );
};

Loading.propTypes = {
  hidden: PropTypes.bool.isRequired,
  text: PropTypes.string,
  children: PropTypes.element.isRequired
};

export default Loading;
