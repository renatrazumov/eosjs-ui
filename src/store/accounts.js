import {observable, computed, extendObservable, toJS} from 'mobx'
import {lazyObservable, fromPromise} from 'mobx-utils'

const Account = {
  get formattedBalance() {
    return this.value.eos_balance + ' EOS' // FIXME
  },
  get hasBalance() {
    return this.value.eos_balance !== 0
  }
}

export default class Accounts {

  constructor(eos) {
    this.eos = eos
    this.accounts = {}
  }

  get(name) {
    if(this.accounts[name])
      return this.accounts[name]

    const lazy = lazyObservable(
      sink => {
        const promise = fromPromise(this.eos.getAccountAsync(name))
        extendObservable(promise, Account)
        sink(promise)
      }
    )
    lazy.refresh()
    this.accounts[name] = lazy
    return lazy
  }
}

// todo .babelrc transform-regenerator
// import {asyncAction} from 'mobx-utils'
// class C {@asyncAction *go() { const v = yield Promise.resolve(2) }}
