'use strict';

import expressRateLimit from 'express-rate-limit';
import csrf from 'csurf';
import helmet from 'helmet';

export default function(app) {
  app.enable('trust proxy');

  app.use(helmet({
    noCache: false,
    frameguard: false
  }));

  app.use(['shop/api/', 'police/api/', 'repair-shop/api/', 'insurance/api/'],
  expressRateLimit({
    windowMs: 30 * 1000,
    delayMs: 0,
    max: 50
  }));

  const csrfProtection = csrf({
    cookie: true
  });

  app.get('/*', csrfProtection, (req, res, next) => {
    if (!res.locals) {
      res.locals = {};
    }
    res.locals.ct = req.csrfToken();
    next();
  });

}
