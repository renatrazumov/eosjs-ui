import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {modules} from 'eosjs'

import styles from './styles.scss'
import form from '../../utils/ReactStateForm'

const {ULong, isName} = modules.format

@inject('chain')
@observer
class Transfer extends Component {

  componentWillMount() {
    const {location} = this.props
    const urlParms = hashParams(location.hash)

    form(this, {
      debug: false,
      fields: ['from', 'to', 'amount'],

      submitInitialValues: true,
      initialValues: {
        from: urlParms.from,
        to: urlParms.to,
        amount: urlParms.amount
      }
    })
  }

  checkFrom = ({from}) => this.checkAccount('from', from)

  checkTo = ({to}) => this.checkAccount('to', to)

  checkAccount = (field, value) => {
    if(!value) {
      return 'Required'
    }

    if(!isName(value)) {
      return 'Invalid Name'
    }

    const accountPromise = this.props.chain.accounts.get(value).current()
    return accountPromise.then(() => null).catch(() => {throw 'Account not found'})
  }

  onAmount = amount => String(amount).replace(/[^\d\.]/g, '') // just digits and decimal

  checkAmount = ({amount}) => {
    if(!amount) {
      return 'Required'
    }
    const parts = String(amount).split('.')
    if(parts.length > 2) {
      return 'Invalid amount'
    }
    if(parts.length === 2 && parts[1].length > 3) {
      return 'Use only 3 digits of precision'
    }
    if(amount == '0') {
      return 'Amount must be greater than zero'
    }

    const {state: {from}, props: {chain}} = this

    return chain.accounts.get(from.value).current()
    .catch(error => {console.error('Checking balance', error)})
    .then(account => {
      // console.log('account.eos_balance', account.eos_balance, ULong(amount))
      if(ULong(amount).compare(ULong(account.eos_balance)) > 0) {
        throw 'Insufficient funds'
      }
    })
  }

  onSubmit = ({from, to, amount}) => {
    // return eos.transfer(from, to, amount)
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('Thank You')
      }, 1000)
    })
  }

  onSubmitEvent = (form, preSubmit) => {
    form.spinner = preSubmit ? <div className={styles.spinner}></div> : null
  }

  onMessage = (element, message) => {
    if(/Required|Account not found/.test(message) && !element.blur)
      return <div>&nbsp;</div>

    return <div style={{color: element.valid ? 'green' : 'red'}}>{message}&nbsp;</div>
  }

  render () {
    const {form, from, to, amount} = this.state
    return (
      <section>
        <form {...form.props}>
          <fieldset>
            <legend>Transfer</legend>

            <div>
              <label htmlFor="from">From</label>
              <br />
              <input {...from.props} type="text" placeholder="From account"
                autoComplete="off" autoCorrect="off" spellCheck="false"
                autoCapitalize="off" />

              {from.message}
            </div>

            <br />

            <div>
              <label htmlFor="to">To</label>
              <br />
              <input {...to.props} type="text" placeholder="Send to"
                autoComplete="off" autoCorrect="off" spellCheck="false"
                autoCapitalize="off" />

              {to.message}
            </div>

            <br />

            <div>
              <label htmlFor="amount">Amount</label>
              <br />
              <input {...amount.props} type="text" placeholder="Amount"
                autoComplete="off" autoCorrect="off" spellCheck="false"
                autoCapitalize="off" />

              {amount.message}
            </div>

            <br />

            <div>
              <button {...form.submit} type="submit" className="button">
              Submit
              </button>

              &nbsp;&nbsp;

              <button {...form.reset} type="reset" className="button">
              Reset
              </button>

              &nbsp;&nbsp;

              <button {...form.clear} type="clear" className="button">
              Clear
              </button>

            </div>

            {form.message}
            {form.spinner}

          </fieldset>
        </form>
      </section>
    )
  }
}

function hashParams(query) {
  if(/^#/.test(query)) {
      query = query.substring(1)
  }
  const params = {}
  for(let pair of query.split('&')) {
    const [lv, rv] = pair.split('=')
    if(lv == null)
      continue

    params[decodeURIComponent(lv)] = rv == null ? rv : decodeURIComponent(rv)
  }
  return params
}

export default Transfer
