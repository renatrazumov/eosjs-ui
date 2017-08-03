import eosjs from 'eosjs'
import isBrowser from 'is-in-browser'
import {promisifyAll} from 'sb-promisify'
import {observable, action} from 'mobx'
import Accounts from './accounts'

/**
  Provides chain data stores bound to a given API or network connection.
*/
class ChainStore {

  @observable accounts

  @action.bound
  setApi(eos) {
    this.eos = eos
    this.accounts = new Accounts(eos)
  }

}

const testnetConfig = {}
if(isBrowser) {
  // Proxy unless eosd is available with Access-Control-Allow-Origin endpoint
  testnetConfig.httpEndpoint = ''
}
const newEos = () => promisifyAll(eosjs.Testnet(testnetConfig))

const chain = new ChainStore
chain.setApi(newEos())

export default chain

// Testing only, API change should refresh app
// if(isBrowser) {window.chain = chain; window.newEos = newEos}
