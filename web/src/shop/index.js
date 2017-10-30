'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { IntlProvider, addLocaleData, defineMessages } from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import deLocaleData from 'react-intl/locale-data/de';

import getLocale from '../shared/getLocale';
import { setShopType } from './actions/shopActions';
import { loadContractsTypes } from './actions/insuranceActions';
import AppRouter from './router';
import configStore from './store';
import translations from './translations';
import products from './products';

const shopType = window.location.pathname.split('/').filter(e => !!e)[1];
const store = configStore();
if (typeof shopType == 'string' && shopType.length > 0) {
  store.dispatch(setShopType(shopType, products[shopType]));
  store.dispatch(loadContractsTypes(shopType));
}

const locale = getLocale();
addLocaleData([...deLocaleData, ...enLocaleData]);

window.digitalData.page.pageInfo.language = locale;

render(
  <IntlProvider locale={locale} messages={translations[locale]} defaultLocale='en'>
    <StoreProvider store={store}>
      <AppRouter shopType={shopType} />
    </StoreProvider>
  </IntlProvider>,
  document.getElementById('app')
);
