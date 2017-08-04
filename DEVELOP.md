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

# Coding Guidelines

* Avoid checking in duplicate data (like generated code)
* Code is our best form of comments but comment anything that is unclear
* Don't mess up the diff (code reviews are important)
* Abstract or make obsolete boilerplate code
* Comment all hacks
