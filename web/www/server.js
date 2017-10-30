#! /usr/bin/env node
'use strict';

import 'babel-polyfill';
import dotenv from 'dotenv';
import deploymentTracker from 'cf-deployment-tracker-client';
import server from './app';

if (process.env.NODE_ENV === 'production') {
  require('babel-register');
}

const port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;

dotenv.config({ silent: true });
deploymentTracker.track();

server.listen(port, () => {
  console.log('Server running on port: %d', port);
});
