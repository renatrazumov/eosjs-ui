import express from 'express';
import compression from 'compression';
import path from 'path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import RouterContext from 'react-router/lib/RouterContext';
import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import match from 'react-router/lib/match';
import template from './template';
import routes from '../routes';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';

const request = require('request')
const config = require('config')

mobx.useStrict(true);//ensure mutations happen in an @action

// https://www.npmjs.com/package/mobx-react#server-side-rendering-with-usestaticrendering
mobxReact.useStaticRendering(true)

mobxReact.onError(error => {
  process.stdout.write('Observer error: ')
  console.error(error)
})

const clientAssets = require(KYT.ASSETS_MANIFEST); // eslint-disable-line import/no-dynamic-require
const port = parseInt(KYT.SERVER_PORT, 10);
const app = express();

// Remove annoying Express header addition.
app.disable('x-powered-by');

if(config.has('EosdProxyEndpoint')) {
  // Proxy unless eosd is available with Access-Control-Allow-Origin endpoint
  app.post(/\/v[\d]+\/.+/, (req, res) => {
    const endpoint = config.get('EosdProxyEndpoint')
    const uri = `${endpoint}${req.originalUrl[0] === '/' ? '' : '/'}${req.originalUrl}`

    const post = request.post(uri/*, {qs: req.query}*/)
    const onError = error => {
      console.error('EosdProxyEndpoint', uri, error.message)
      // 502 - Bad Gateway
      res.status(502).send('Bad Gateway, try again')
    }
    post.on('error', onError) // handle error or request will never re-connect
    req.pipe(post).pipe(res)
  })
}

// Compress (gzip) assets in production.
app.use(compression());

// Setup the public directory so that we can server static assets.
app.use(express.static(path.join(process.cwd(), KYT.PUBLIC_DIR)));

// Setup server side routing.
app.get('*', (request, response) => {
  const history = createMemoryHistory(request.originalUrl);

  match({ routes, history }, (error, redirectLocation, renderProps) => {
    if (error) {
      response.status(500).send(error.message);
    } else if (redirectLocation) {
      response.redirect(302, `${redirectLocation.pathname}${redirectLocation.search}`);
    } else if (renderProps) {
      // When a React Router route is matched then we render
      // the components and assets into the template.
      response.status(200).send(
        template({
          root: renderToString(<RouterContext {...renderProps} />),
          manifestJSBundle: clientAssets['manifest.js'],
          mainJSBundle: clientAssets['main.js'],
          vendorJSBundle: clientAssets['vendor.js'],
          mainCSSBundle: clientAssets['main.css'],
        })
      );
    } else {
      response.status(404).send('Not found');
    }
  });
});

app.listen(port, () => {
  console.log(`✅  Started ${process.env.NODE_ENV} on port: ${port}`); // eslint-disable-line no-console
});
