'use strict';

import i18n from 'i18n';
import path from 'path';

export default function (app) {
  const isDev = app.get('env') === 'development';

  i18n.configure({
    locales: ['en', 'de'],
    fallbacks: {
      'de_DE': ['de', 'en'],
      'de': ['en']
    },
    cookie: 'applang',
    queryParameter: 'applang',
    autoReload: isDev,
    directory: path.resolve(__dirname, "../../locales")
  });

  // Set cookie 'applang' if query parameter is set to persist result
  app.use((req, res, next) => {
    const langParam = req.query['applang'];
    if (langParam) {
      res.cookie('applang', langParam);
    }
    next();
  });
  app.use(i18n.init);
}
