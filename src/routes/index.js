import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRoute from 'react-router/lib/IndexRoute';
import App from '../components/App';

// Webpack 2 supports ES2015 `import()` by auto-
// chunking assets. Check out the following for more:
// https://webpack.js.org/guides/migrating/#code-splitting-with-es2015

const importHome = (nextState, cb) => {
  import(/* webpackChunkName: "home" */ '../components/Home')
    .then(module => cb(null, module.default))
    .catch(e => {
      throw e;
    });
};

const importAccountInfo = (nextState, cb) => {
  import(/* webpackChunkName: "accountInfo" */ '../components/AccountInfo')
    .then(module => cb(null, module.default))
    .catch(e => {
      throw e;
    });
};

const importTransfer = (nextState, cb) => {
  import(/* webpackChunkName: "accountInfo" */ '../components/Transfer')
    .then(module => cb(null, module.default))
    .catch(e => {
      throw e;
    });
};

// `getComponent` dynamically loads routes.
// https://github.com/reactjs/react-router/blob/master/docs/guides/DynamicRouting.md
const routes = (
  <Route path="/" component={App}>
    <IndexRoute getComponent={importHome} />
    <Route path="@(:name)" getComponent={importAccountInfo} />
    <Route path="transfer" getComponent={importTransfer} />
  </Route>
);

// Unfortunately, HMR breaks when we dynamically resolve
// routes so we need to require them here as a workaround.
// https://github.com/gaearon/react-hot-loader/issues/288
if (module.hot) {
  require('../components/Home'); // eslint-disable-line global-require
  require('../components/AccountInfo'); // eslint-disable-line global-require
  require('../components/Transfer'); // eslint-disable-line global-require
}

export default routes;
