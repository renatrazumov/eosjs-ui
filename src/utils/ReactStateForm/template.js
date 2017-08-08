import React, {Component} from 'react'
import form from '.'

let simulateError = true

export default class Template extends Component {

  componentWillMount() {
    form(this, {
      fields: [
        'account',
        'looking:selected',
        'space:checked'
      ],

      submitInitialValues: false,
      initialValues: {
        account: 'horus',
        looking: 'in',
        space: false
      }

    })
  }

  onAccount = account => account.toLowerCase().replace(/[^\da-z]/g, '')

  // Null is no error
  // A String is the same as Promise.reject (when validating)
  checkAccount = ({account}) => !/^[a-z0-9]+$/.test(account) ? 'Invalid Name' : null

  // Promise.resolve leaves the field valid but prints the message (like: info, or warning)
  checkLooking = ({looking}) => looking === 'out' ? Promise.resolve('Tip: Answers are within') : null

  // Non-blocking form-level info or warning message
  checkSpace = ({space}) => space ? Promise.resolve({form: 'Warning, Interplanetary connection required'}) : null

  onSubmit = ({data: {space}}) => {
    if(space && simulateError) {
      simulateError = !simulateError
      // Form-level info message
      // A String is the same as Promise.resolve (when submitting)
      return 'Wow, instant interplanetary success!'
    }
    simulateError = !simulateError

    return new Promise((resolve, reject) => {
      const action = () => {
        if(space) {
          reject({
            space: 'Error: Interplanetary connection is buggy',
            form: 'Network error'
          })
        } else {
          resolve('Success')
        }
      }
      setTimeout(action, 500)
    })
  }

  onMessage = (element, message) => {
    // Form and field elements are similar
    // const isForm = !!element.submit

    // Filtering on blur hides errors duing initial data-entry
    return <div style={{color: element.valid ? 'green' : 'red'}}>{message}&nbsp;</div>
  }

  render () {
    const {form, account, looking, space} = this.state

    return (
      <section>
        <form {...form.props}>
          <fieldset>
            <legend>Template</legend>

            <div>
              <label htmlFor="account">Account</label>
              <br />
              <input {...account.props}
                type="text" placeholder="Send to account"
                autoComplete="off" autoCorrect="off" spellCheck="false"
                autoCapitalize="off" />

              {account.message}
            </div>

            <br />

            <div>
              <label htmlFor="looking">Looking</label>
              <br />
              <select {...looking.props}>
                <option value="in">Inward</option>
                <option value="out">Outward</option>
              </select>

              {looking.message}
            </div>

            <br />

            <div>
              <label htmlFor="space">Space</label>
              <br />
              <input {...space.props} type="checkbox"/>

              {space.message}
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

          </fieldset>
        </form>
      </section>
    )
  }
}
