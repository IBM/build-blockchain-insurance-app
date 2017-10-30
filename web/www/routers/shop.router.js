'use strict';

import express from 'express';

import * as ShopPeer from '../blockchain/shopPeer';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('shop-main', { shopActive: true });
});

router.get('/login', (req, res) => {
  res.render('login', { shopActive: true });
});

router.post('/api/contract-types', async (req, res) => {
  if (typeof req.body !== 'object') {
    res.json(null);
  }
  let letter;
  switch ((req.body.shopType || '').toLowerCase()) {
    case 'bikes':
      letter = 'B';
      break;
    case 'smart-phones':
      letter = 'P';
      break;
    case 'skis':
      letter = 'S';
      break;
    default:
      letter = '';
      break;
  }

  let contractTypes;
  try {
    contractTypes = await ShopPeer.getContractTypes(letter);
  } catch (e) {
    console.log(e);
    res.json({ error: "Could not retrieve contract types!" });
  }

  if (!Array.isArray(contractTypes)) {
    res.json({ error: "Could not retrieve contract types!" });
  }
  res.json(
    contractTypes.map(contractType => {
      let mapped = Object.assign({}, contractType);
      delete mapped.shopType;
      return mapped;
    }));
});

router.post('/api/request-user', async (req, res) => {
  let { user } = req.body;
  let { firstName, lastName, email } = user || {};
  if (typeof user === 'object' &&
    typeof firstName === 'string' &&
    typeof lastName === 'string' &&
    typeof email === 'string') {

    let passwordProposal = generatePassword();
    try {
      let responseUser = await ShopPeer.createUser({
        username: email,
        firstName: firstName,
        lastName: lastName,
        password: passwordProposal
      });
      res.json(responseUser || { username: email, password: passwordProposal });
    } catch (e) {
      console.log(e);
      res.json({ error: 'Could not create new user!' });
    }
  } else {
    res.json({ error: 'Invalid request!' });
  }
});

router.post('/api/enter-contract', async (req, res) => {
  let { user, contractTypeUuid, additionalInfo } = req.body;
  if (typeof user === 'object' &&
    typeof contractTypeUuid === 'string' &&
    typeof additionalInfo === 'object') {
    try {
      let { username, firstName, lastName } = user;
      const passwordProposal = generatePassword();
      let loginInfo = await ShopPeer.createContract({
        contractTypeUuid,
        username,
        password: passwordProposal,
        firstName,
        lastName,
        item: additionalInfo.item,
        startDate: additionalInfo.startDate,
        endDate: additionalInfo.endDate
      });
      res.json({ success: 'Contract signed.', loginInfo });
    } catch (e) {
      console.log(e);
      res.json({ error: 'Could not create new contract!' });
    }
  } else {
    res.json({ error: 'Invalid request!' });
  }
});

router.post('/api/blocks', async (req, res) => {
  const { noOfLastBlocks } = req.body;
  if (typeof noOfLastBlocks !== 'number') {
    res.json({ error: 'Invalid request' });
  }
  try {
    const blocks = await ShopPeer.getBlocks(noOfLastBlocks);
    res.json(blocks);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.get('*', (req, res) => {
  res.render('shop', {
    shopActive: true,
    bikesActive: req.originalUrl.includes('bikes'),
    smartPhonesActive: req.originalUrl.includes('smart-phones'),
    skisActive: req.originalUrl.includes('skis')
  });
});

function generatePassword() {
  let passwordType = Math.floor(Math.random() * 4);
  let password;
  switch (passwordType) {
    case 0:
      password = 'test';
      break;
    case 1:
      password = 'demo';
      break;
    case 2:
      password = 'pass';
      break;
    case 3:
      password = 'secret';
      break;
    case 4:
    default:
      password = 'qwerty';
  }
  password += Math.floor(Math.random() * (99 - 10) + 10);
  return password;
}

function wsConfig(io) {
  ShopPeer.on('block', block => { io.emit('block', block); });
}

export default router;
export { wsConfig };
