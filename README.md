# About

General purpose web interface for the EOS blockchain.

Status: Alpha (for developers)

# Requirement

Build and run [eosd](https://github.com/eosio/eos) or direct requests to a public testnet or production node.

# Configuration

See [npm/config](http://npmjs.com/package/config) and [./config](./config).

In summary, the kyt environment automatically sets NODE_ENV to `development`
(in `npm run dev`).  For local customizations, you can copy [./config/development.json](./config/development.json)
to a new name (like ./config/myconfig.json) set NODE_ENV=myconfig.

# Start

```bash
npm install
npm run dev
```

# Architecture

This is an Isomorphic React Web Application.

* Based on: Universal React Starter Kyt
* The [chain](src/store/chain.js) store is a factory for blockchain related stores.  This store is conveniently available to components through the class-level `@inject` decorator.  Inject is getting the chain instance from [Provider](https://www.npmjs.com/package/mobx-react#provider-and-inject) in the app's root component [components/App](src/components/App/index.js).
* The first blockchain data example is AccountInfo.  It is setup to know about and re-render in response to any connection errors or changes and provide cached and refreshed state.  Each component gets to decide how important it is to be in sync and how much information to give the user.  See [store/accounts](src/store/accounts.js), [components/AccountInfo](src/components/AccountInfo/index.js), and [routes](src/routes/index.js) (account name provided by route).

# Related Libraries

* eosjs [[Github](https://github.com/eosjs/eosjs), [NPM](https://www.npmjs.org/package/eosjs)]
* MobX [https://mobx.js.org](https://mobx.js.org), [mobx-react](https://www.npmjs.com/package/mobx-react), and [mobx-utils](https://github.com/mobxjs/mobx-utils)
* Express [https://expressjs.com](https://expressjs.com)
* React [https://facebook.github.io/react](https://facebook.github.io/react)
* React Router [https://github.com/reactjs/react-router](https://github.com/reactjs/react-router)
* Sass Modules [https://github.com/css-modules/css-modules](https://github.com/css-modules/css-modules)

# Environment

Node 8+ and Browser
