
module.exports = reactForm

/**
    For usage, see ./template.js

    TODO multi-select
        <select multiple ...

    TODO radio
        <label><input {...looking.props('in')} type="radio" />Inward</label>
        <label><input {...looking.props('out')} type="radio" />Outward</label>
*/

/**
    @arg {object} instance - `this` for the component
    @arg {string} name - form state will appear in this.state[name]
    @arg {array} fields - ['username', 'save', ...]
    @arg {object} initialValues required for checkboxes {save: false, ...}
*/
function reactForm(instance, {
    name = 'form',
    fields,
    initialValues,
    submitInitialValues = true,
    debug = false
}) {
    if(typeof instance !== 'object') throw new TypeError('instance is a required object')
    if(!Array.isArray(fields)) throw new TypeError('fields is a required array')
    if(typeof initialValues !== 'object') throw new TypeError('initialValues is a required object')

    let state = instance.state
    if(!state) {
        state = instance.state = {}
    }

    for(let fieldName of fields) {
        const field = state[fieldName]
        if(!field) {
            state[fieldName] = {}
        }
    }

    if(!instance.onSubmit) {
        throw new Error('Your component needs a submit function: onSubmit = ({data}) => {...}')
    }

    let form = state[name]
    if(!form) {
        form = state[name] = {}
    }

    // form.submitInitialValues = submitInitialValues
    // form.debug = debug

    // <form {...form.props}
    form.props = {}

    // <button type="submit" {...form.submit}
    form.submit = {
        onClick: form.props.onSubmit,
        disabled: !submitInitialValues
    }

    // <button {...form.reset}
    form.reset = {
        onClick: event => inheritPromiseMethod(instance, form, 'onReset', event)
    }

    form.onReset = (event) => {
        if(event) {
            event.preventDefault()
        }

        form.valid = true
        form.touched = false
        form.submitting = false
        form.submit.disabled = !submitInitialValues
        form.message = onMessage(instance, form, '')

        for(const field of fields) {
            const fieldName = getName(field)
            const f = instance.state[fieldName]
            const def = initialValues[fieldName]
            f.props.onChange(def)
        }
    }

    // <button {...form.clear}
    form.clear = {
        onClick: event => inheritPromiseMethod(instance, form, 'onClear', event)
    }

    form.onClear = (event) => {
        if(event) {
            event.preventDefault()
        }
        for(const field of fields) {
            const fieldName = getName(field)
            const f = instance.state[fieldName]
            f.props.onChange()
        }
    }

    // Manually trigger validation (probably not needed)
    // form.validate = () => setFormState(),

    // Setup all the fields
    for(const fieldNameType of fields) {
        const fieldName = getName(fieldNameType)
        const fieldType = getType(fieldNameType)

        const field = state[fieldName] = {
            value: null,
            valid: null,
            touched: false,
        }

        // Caution: field.props is expanded <input {...fieldName.props} />, so only add valid props for the component
        field.props = {name: fieldName}
        field.props.id = fieldName
        field.props.ref = fieldName
        field.message = onMessage(instance, field, '')
        field.blur = false

        setTypedValue(field, fieldType, initialValues[fieldName])

        field.props.onChange = e => {
            const isEvent = e && typeof e.target === 'object'
            let value = e && isEvent ? e.target.value : e // API may pass value directly

            if(isEvent) {
                const method = `on${fieldName[0].toUpperCase()}${fieldName.substring(1)}`
                const onChange = instance[method]
                if(onChange) {
                    value = onChange(value)
                }

                 // <select multiple ...
                // if(e.target.options) {
                //     const selections = []
                //     for(let option of e.target.options) {
                //         const optionValue = option.value
                //         if(option.selected) {
                //             selections.push(option.value)
                //         }
                //     }
                //     value = selections
                // }
            }

            const field2 = Object.assign({}, instance.state[fieldName])
            const initialValue = initialValues[fieldName]

            if(fieldType === 'checked' && isEvent) {
                value = !field2.value
            }

            if(!isEvent) { // clear or reset
                field2.blur = false
            }

            setTypedValue(field2, fieldType, value, initialValue)

            instance.setState(
                {[fieldName]: field2},
                () => {setFormState()}
            )
        }

        field.props.onBlur = () => {
            // Some errors are better shown only after blur === true
            const newField = Object.assign({}, instance.state[fieldName])
            newField.blur = true
            instance.setState(
                {[fieldName]: newField},
                () => {setFormState()}
            )
        }
    }

    form.onSubmit = submitCallback => (event) => {
        event.preventDefault()

        // Unless alreadyDisabled re-enable after submitting
        const alreadyDisabled = {}
        for(const field of fields) {
            const fieldName = getName(field)
            if(state[fieldName].props.disabled) {
                alreadyDisabled[fieldName] = true
            }
        }

        // Validate form.. submitting = true will disable fields
        setFormState(true/*submitting*/).then(valid => {
            if(!valid) return
            form = state[name] // get new form clone
            form.submitting = true
            form.message = onMessage(instance, form, '')

            if(instance.onSubmitEvent) {
              instance.onSubmitEvent(form, true)
            }

            instance.setState(
                {[name]: form},
                () => {
                    let submit
                    let formValid = true

                    const data = getData(fields, instance.state)
                    try {
                        submit = submitCallback(data, event)
                    } catch(error) {
                        submit = Promise.reject(error)
                    }

                    normalizeResult(submit, name, fields, true/*postSubmit*/).then(result => {
                        // Look for async field leavel data in user's result
                        for(const f of fields) {
                            const fieldName = getName(f)
                            const field = Object.assign({}, instance.state[fieldName])

                            // re-enable after submit
                            if(!alreadyDisabled[fieldName]) {
                                field.props.disabled = false
                                instance.setState({[fieldName]: field})
                            }

                            const fieldResult = result[fieldName]
                            if(!fieldResult) {
                                field.message = onMessage(instance, field, '')
                                continue
                            }

                            if(fieldResult.valid != null) {
                                field.touched = !fieldResult.valid
                                field.blur = !fieldResult.valid
                                field.valid = fieldResult.valid
                            }
                            field.message = onMessage(instance, field, fieldResult.message)
                            instance.setState({[fieldName]: field})
                        }

                        const formResult = result[name]
                        if(formResult) {
                            if(formResult.valid === false) {
                                formValid = false
                            }
                        }

                        form.touched = !formValid
                        form.valid = formValid
                        form.submit.disabled = formValid
                        form.submitting = false
                        form.message = onMessage(instance, form, formResult ? formResult.message : '')
                        if(instance.onSubmitEvent) {
                          instance.onSubmitEvent(form, false)
                        }

                        instance.setState({[name]: form}, ()=> {
                            if(formValid) {
                                // No errors, these are the new inital values (for onReset)
                                setInitialValuesFromForm(name, instance, fields, initialValues)
                            }
                        })
                    })
                    .catch(error => {
                        if(error) {
                            console.error(error)
                        }
                    })
                }
            )
        })
    }

    form.props.onSubmit = form.onSubmit(instance.onSubmit)
    form.message = onMessage(instance, form, '')

    function setFormState(submitting = false) {
        let formValid = true
        let formTouched = false
        let formMessage = null
        const promises = []
        const fieldData = getData(fields, instance.state)

        for(const f of fields) {
            const fieldName = getName(f)
            if(fieldName.length < 2) {
                throw new Error(`Please use a longger fielld name: ${fieldName}`)
            }

            // Validation Method: onMyField = ({myfielld}) => myfield === 'valid'
            const method = `check${fieldName[0].toUpperCase()}${fieldName.substring(1)}`
            let validate = instance[method]

            if(validate) {
                try {
                    validate = validate(fieldData)
                } catch(error) {
                    validate = Promise.reject(error)
                }
            }

            const validatePromise = normalizeResult(validate, name, fieldName, false).then(result => {
                const formResult = result[name]
                if(formResult) {
                    if(formResult.valid === false) {
                        formValid = false
                    }
                    if(formResult.message) {
                        formMessage = formResult.message
                    }
                }

                const fieldResult = result[fieldName]
                if(fieldResult) {
                    if(fieldResult.valid === false) {
                        formValid = false
                    }

                    const field = Object.assign({}, instance.state[fieldName])

                    field.valid = fieldResult.valid
                    if(submitting && fieldResult.valid === false) {
                        // The UI may decide to hide an error while the user is typing
                        // then show it when leaving the field (on blur).  The browser
                        // will not necessarily blur the current field when Enter is
                        // used to submit a form.  Do this manually.
                        field.blur = true
                    }
                    field.props.disabled = submitting
                    formTouched = formTouched || field.touched
                    field.message = onMessage(instance, field, fieldResult.message)
                    instance.setState({[fieldName]: field})
                }
                else {
                    field.message = onMessage(instance, field, '')
                }
            })

            // instance.state[fieldName].postValidation = validatePromise
            promises.push(validatePromise)
        }
        return Promise.all(promises).then(error => {
            const form = Object.assign({}, instance.state[name])
            form.valid = formValid
            form.touched = formTouched
            form.submit.disabled = submitting || !formValid || (!submitInitialValues && !formTouched)
            form.message = onMessage(instance, form, formMessage)
            instance.setState({[name]: form})
            return form.valid
        })
    }

    /**
        See comments in template.js .. Normalize user's Validation and onSubmit return values..

        @return {object} {
            form: {valid, message},
            myfield: {valid, message}
        }
    */
    function normalizeResult(result = '', name, fields = null, postSubmit) {
        let hadError = false
        const wasPromise = result && typeof result.then === 'function'

        return Promise.resolve(result).catch(error => {
            hadError = true
            return error
        })
        .then(result => {
            const validating = typeof fields === 'string'

            // Most common use cases:
            // The submit tends to rely on a Promise (hadError) and validation tends to be static.
            // So, non-null during validation is an error, during submit it just a message.
            const valid =
                wasPromise ? !hadError :
                validating ? result == null :
                postSubmit

            if(result && typeof result.statusText === 'string') {
                result = result.statusText
            }

            if(typeof result !== 'object' || result === null) {
                // During validation fields is the name of the field
                // During submit fields is an array of all form fields
                const target = validating ? fields : name/*formName*/
                return {
                    [target]: {
                        message: result,
                        valid
                    }
                }
            }

            if(typeof result !== 'object') {
                throw new TypeError('TypeError: ' + (typeof result))
            }

            const ret = Object.assign({}, result)

            if(validating) {
                if(!ret[fields]) {
                    ret[fields] = {message: null, valid}
                }
            }

            for(let field in ret) {
                let retField = ret[field]
                if(typeof retField !== 'object') {
                    retField = {message: retField}
                    ret[field] = retField
                }
                if(retField.valid == null) {
                    retField.valid = valid
                }
            }

            return ret
        })
        .then(r => {
            if(debug) {
                console.log('normalizeResult', r)
            }
            return r
        })
    }

    function setInitialValuesFromForm(name, instance, fields, initialValues) {
        const data = getData(fields, instance.state)
        for(const field of fields) {
            const fieldName = getName(field)
            initialValues[fieldName] = data[fieldName]
        }
    }

    function getData(fields, state) {
        const data = {}
        for(const field of fields) {
            const fieldName = getName(field)
            data[fieldName] = state[fieldName].value
        }
        return data
    }

    /*
        @arg {string} field - field:type
        <pre>
            type = checked (for checkbox or radio)
            type = selected (for seelct option)
            type = string
        </pre>
        @return {string} type
    */
    function getType(field) {
        const [, type = 'string'] = field.split(':')
        return type
    }

    /**
        @return {string} name
    */
    function getName(field) {
        const [name] = field.split(':')
        return name
    }

    function setTypedValue(fs, fieldType, value, initialValue = value) {
        // value == null is onClear
        if(fieldType === 'checked') {
            fs.value = value
            fs.props.checked = toBoolean(value)
        } else if(fieldType === 'selected') {
            //typeof value === 'array' multiselect
            fs.value = value
            fs.props.selected = value
        } else {
            fs.value = fs.props.value = toString(value)
        }
        fs.touched = toString(value) !== toString(initialValue)
    }

    function onMessage(instance, field, message) {
        let msg = message
        if(instance.onMessage) {
            msg = instance.onMessage(field, message)
        }
        return msg ? msg : '.'
    }

    // initial form load
    form.onReset()
}

/** Allows the form component to plugin to events. */
function inheritPromiseMethod(parent, child, method, ...args) {
    if(parent[method]) {
        return Promise.resolve(parent[method](...args))
            .catch(error => {if(error) console.error(error)})
            .then(child[method](...args))
    }
    return child[method](...args)
}

const hasValue = v => v == null ? false :
    (typeof v === 'string' ? v.trim() : v) === '' ? false : true

const toBoolean = v => !hasValue(v) ? false :
    v === 'on' ? true : v === 'off' ? false : JSON.parse(v)

const toString = v => hasValue(v) ? v : ''
