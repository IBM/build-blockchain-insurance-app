'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { IntlProvider, addLocaleData, defineMessages } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import deLocaleData from 'react-intl/locale-data/de';

import getLocale from '../shared/getLocale';
import translations from './translations';
import Container from './components/Container.js';
import './style.scss';

addLocaleData([...enLocaleData, ...deLocaleData]);

const locale = getLocale();
const roolEl = document.getElementById('block-explorer');
const render = Component => {
  ReactDOM.render(
    <IntlProvider locale={locale} messages={translations[locale]} defaultLocale='en'>
      <AppContainer>
        <Component />
      </AppContainer>
    </IntlProvider>,
    roolEl
  );
};

render(Container);

if (module.hot) {
  module.hot.accept('./components/Container.js', () => { console.log('Reloaded'); render(Container); });
}
