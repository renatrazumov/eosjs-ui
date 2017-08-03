import React, { PropTypes } from 'react';
import Link from 'react-router/lib/Link';
import styles from './styles.scss';

import {Provider} from 'mobx-react'
import chain from '../../store/chain'

function App({ children, params }) {
  const homePage = Object.keys(params).length === 0
  return (
    <div>
      <ul className={styles.nav}>
        <li className={styles.navItem}>
          <Link className={styles.link} to="/">
            Home
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={styles.link} to="/eos">
            Eos
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link className={styles.link} to="/inita">
            InitA
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
