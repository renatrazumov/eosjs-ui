import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router/lib/Link';
import styles from './styles.scss';

import {Provider} from 'mobx-react'
import chain from '../../store/chain'

function App({ children, location }) {
  // console.log('location', location)
  const homePage = location.pathname === '/' && location.hash === ''
  return (
    <div>
      <ul className={styles.nav}>
        <li className={styles.navItem}>
          <Link className={styles.link} to="/">
            Home
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={styles.link} to="/transfer#from=eos&to=inita&amount=1">
            Transfer
          </Link>
        </li>
      </ul>
      {homePage && <i className={styles.logo} />}
      <div className={styles.content}>
        <Provider chain={chain}>
          {children}
        </Provider>
      </div>
    </div>
  );
}

App.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired
};

export default App;
