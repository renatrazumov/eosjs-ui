import React, {Component} from 'react';
import styles from './styles.scss';
import {observer, inject} from 'mobx-react';

@inject('chain') @observer
class AccountInfo extends Component {

  componentWillMount() {
    const {chain, params} = this.props
    chain.accounts.get(params.name).refresh()
  }

  componentWillReceiveProps(nextProps) {
    const {chain, params} = nextProps
    chain.accounts.get(params.name).refresh()
  }

  render () {
    const {chain, params} = this.props
    const account = chain.accounts.get(params.name).current()

    const ren = account.case({
      pending:   () => <div>Loading...</div>,
      rejected:  error => <div>Ooops.. {error.toString()}</div>,
      fulfilled: value => <div>{account.value.name} {account.formattedBalance}</div>
    })
    return (
      <section>
        {ren}
      </section>
    )
  }
}

export default AccountInfo
