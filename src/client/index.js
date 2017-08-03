import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './Root';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';


mobx.useStrict(true);//ensure mutations happen in an @action

mobxReact.onError(error => {
  console.error('Observer error')
  console.error(error)
})

const root = document.querySelector('#root');

const mount = RootComponent => {
  render(
    <AppContainer>
      <RootComponent />
    </AppContainer>,
    root
  );
};

if (module.hot) {
  module.hot.accept('./Root', () => {
    // eslint-disable-next-line global-require,import/newline-after-import
    const RootComponent = require('./Root').default;
    mount(RootComponent);
  });
}

mount(Root);
