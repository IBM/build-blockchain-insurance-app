import express from 'express';

import * as InsurancePeer from '../blockchain/insurancePeer';

const router = express.Router();

// Render main page
router.get('/', (req, res) => {
  res.render('insurance-main', { insuranceActive: true });
});

// Claim Processing

router.post('/api/claims', async (req, res) => {
  let { status } = req.body;
  if (typeof status === 'string' && status[0]) {
    status = status[0].toUpperCase();
  }
  try {
    let claims = await InsurancePeer.getClaims(status);
    res.json(claims);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/process-claim', async (req, res) => {
  let { contractUuid, uuid, status, reimbursable } = req.body;
  if (typeof contractUuid !== 'string'
    || typeof uuid !== 'string'
    || !(typeof status === 'string' && status[0])
    || typeof reimbursable !== 'number') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  status = status[0].toUpperCase();

  try {
    const success = await InsurancePeer.processClaim(
      contractUuid, uuid, status, reimbursable);
    res.json({ success });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

// Contract Management
router.post('/api/contract-types', async (req, res) => {
  try {
    const contractTypes = await InsurancePeer.getContractTypes();
    res.json(contractTypes || []);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/create-contract-type', async (req, res) => {
  let {
    shopType,
    formulaPerDay,
    maxSumInsured,
    theftInsured,
    description,
    conditions,
    minDurationDays,
    maxDurationDays,
    active
  } = req.body;
  if (!(typeof shopType === 'string' && shopType[0])
    || typeof formulaPerDay !== 'string'
    || typeof maxSumInsured !== 'number'
    || typeof theftInsured !== 'boolean'
    || typeof description !== 'string'
    || typeof conditions !== 'string'
    || typeof minDurationDays !== 'number'
    || typeof maxDurationDays !== 'number'
    || typeof active !== 'boolean') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  shopType = shopType.toUpperCase();

  try {
    const uuid = await InsurancePeer.createContractType({
      shopType,
      formulaPerDay,
      maxSumInsured,
      theftInsured,
      description,
      conditions,
      minDurationDays,
      maxDurationDays,
      active
    });
    res.json({ success: true, uuid });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

router.post('/api/set-contract-type-active', async (req, res) => {
  const { uuid, active } = req.body;
  if (typeof uuid !== 'string'
    || typeof active !== 'boolean') {
    res.json({ error: 'Invalid request.' });
    return;
  }
  try {
    const success = await InsurancePeer.setActiveContractType(
      uuid, active);
    res.json({ success });
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

// Self Service

router.post('/api/contracts', async (req, res) => {
  if (typeof req.body.user !== 'object') {
    res.json({ error: 'Invalid request!' });
    return;
  }

  try {
    const { username, password } = req.body.user;
    if (await InsurancePeer.authenticateUser(username, password)) {
      const contracts = await InsurancePeer.getContracts(username);
      res.json({ success: true, contracts });
      return;
    } else {
      res.json({ error: 'Invalid login!' });
      return;
    }
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.post('/api/file-claim', async (req, res) => {
  if (typeof req.body.user !== 'object' ||
    typeof req.body.contractUuid !== 'string' ||
    typeof req.body.claim != 'object') {
    res.json({ error: 'Invalid request!' });
    return;
  }

  try {
    const { user, contractUuid, claim } = req.body;
    const { username, password } = user;
    if (await InsurancePeer.authenticateUser(username, password)) {
      await InsurancePeer.fileClaim({
        contractUuid,
        date: new Date(),
        description: claim.description,
        isTheft: claim.isTheft
      });
      res.json({ success: true });
      return;
    } else {
      res.json({ error: 'Invalid login!' });
      return;
    }
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.post('/api/authenticate-user', async (req, res) => {
  if (!typeof req.body.user === 'object') {
    res.json({ error: 'Invalid request!' });
    return;
  }

  try {
    const { username, password } = req.body.user;
    const success = await InsurancePeer.authenticateUser(username, password);
    res.json({ success });
    return;
  } catch (e) {
    console.log(e);
    res.json({ error: 'Error accessing blockchain!' });
    return;
  }
});

router.post('/api/blocks', async (req, res) => {
  const { noOfLastBlocks } = req.body;
  if (typeof noOfLastBlocks !== 'number') {
    res.json({ error: 'Invalid request' });
  }
  try {
    const blocks = await InsurancePeer.getBlocks(noOfLastBlocks);
    res.json(blocks);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

// Block explorer
router.post('/api/blocks', async (req, res) => {
  const { noOfLastBlocks } = req.body;
  if (typeof noOfLastBlocks !== 'number') {
    res.json({ error: 'Invalid request' });
  }
  try {
    const blocks = await InsurancePeer.getBlocks(noOfLastBlocks);
    res.json(blocks);
  } catch (e) {
    res.json({ error: 'Error accessing blockchain.' });
  }
});

// Otherwise redirect to the main page
router.get('*', (req, res) => {
  res.render('insurance', {
    insuranceActive: true,
    selfServiceActive: req.originalUrl.includes('self-service'),
    claimProcessingActive: req.originalUrl.includes('claim-processing'),
    contractManagementActive: req.originalUrl.includes('contract-management')
  });
});

function wsConfig(io) {
  InsurancePeer.on('block', block => {
    io.emit('block', block);
  });
}

export default router;
export { wsConfig };
