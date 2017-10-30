'use strict';

import { Server } from 'http';
import express from 'express';
import socketIo from 'socket.io';
import configureExpress from './config/express';
import shopRouter, { wsConfig as shopWsConfig }
  from './routers/shop.router';
import policeRouter, { wsConfig as policeWsConfig }
  from './routers/police.router';
import repairShopRouter, { wsConfig as repairShopWsConfig }
  from './routers/repair-shop.router';
import insuranceRouter, { wsConfig as insuranceWsConfig }
  from './routers/insurance.router';

const INSURANCE_ROOT_URL = '/insurance';
const POLICE_ROOT_URL = '/police';
const REPAIR_SHOP_ROOT_URL = '/repair-shop';
const SHOP_ROOT_URL = '/shop';

const app = express();
const httpServer = new Server(app);

// Setup web sockets
const io = socketIo(httpServer);
shopWsConfig(io.of(SHOP_ROOT_URL));
policeWsConfig(io.of(POLICE_ROOT_URL));
repairShopWsConfig(io.of(REPAIR_SHOP_ROOT_URL));
insuranceWsConfig(io.of(INSURANCE_ROOT_URL));

configureExpress(app);

app.get('/', (req, res) => {
  res.render('home', { homeActive: true });
});

// Setup routing
app.use(SHOP_ROOT_URL, shopRouter);
app.use(POLICE_ROOT_URL, policeRouter);
app.use(REPAIR_SHOP_ROOT_URL, repairShopRouter);
app.use(INSURANCE_ROOT_URL, insuranceRouter);

export default httpServer;
