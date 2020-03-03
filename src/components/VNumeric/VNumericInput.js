import Vue from 'vue'
import { VTextField } from 'vuetify/lib'

export default Vue.extend({
  name: 'v-numeric-input',
  props: {
    min: {
      type: Number,
      default: -Number.MAX_VALUE
    },
    max: {
      type: Number,
      default: Number.MAX_VALUE
    },
    lenght: {
      type: Number,
      default: 10
    },
    precision: {
      type: Number,
      default: 0
    },
    negativeTextColor: {
      type: String,
      default: 'red'
    },
    textColor: {
      type: Function,
      default: undefined
    },
    locale: {
      type: String,
      default: 'en-US'
    },
    useGrouping: {
      type: Boolean,
      default: true
    },
    ...VTextField.options.props
  },
  data: () => ({
    internalValue: 0,
    fractDigitsEdited: false,
    fractPart: '0'
  }),
  computed: {
    numberFormatter () {
      return new Intl.NumberFormat(this.locale, {
        useGrouping: this.useGrouping,
        minimumFractionDigits: this.precision
      })
    },
    computedValue () {
      if (this.internalValue) {
        return (this.prefix ? this.prefix : '') + this.numberFormatter.format(this.internalValue)
      }
      return (this.prefix ? this.prefix : '') + this.numberFormatter.format(0)
    },
    computedColor () {
      if (this.internalValue < 0 && this.negativeTextColor) {
        return this.negativeTextColor
      } else return this.color
    }
  },
  watch: {
    value (val) {
      this.internalValue = val
    },
    internalValue (val) {
      this.$emit('change-value', val)
    },
    computedColor (newVal) {
      const input = this.genTextInput()
      if (input) {
        input.style.color = newVal || null
      }
    }
  },
  methods: {
    genTextInput () {
      const inputs = this.$el.getElementsByTagName('input')
      if (inputs && inputs.length > 0) {
        return inputs[0]
      }
    },
    clearValue () {
      this.internalValue = 1
      this.fractPart = '0'
      this.fractDigitsEdited = false
      this.$nextTick(() => {
        if (this.value) {
          this.internalValue = this.value
        } else {
          this.internalValue = 0
        }
      })
    },
    activateCalculator () {
      this.$emit('activate-calculator', this.internalValue)
    },
    keyProcess (keyEvent) {
      if (keyEvent.key !== 'ArrowLeft' && keyEvent.key !== 'ArrowRight') {
        keyEvent.preventDefault()
      }
      keyEvent.stopPropagation()
      const numericButtons = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      let strVal = Math.trunc(this.internalValue).toString()
      if (numericButtons.includes(keyEvent.key)) {
        if (this.fractDigitsEdited) {
          if (this.fractPart === '0' && keyEvent.key !== '0') {
            this.fractPart = keyEvent.key
          } else if (this.fractPart !== '0') {
            this.fractPart += keyEvent.key.toString()
          }
        } else {
          if (strVal === '0' && keyEvent.key !== '0') {
            strVal = keyEvent.key
          } else if (strVal !== '0') {
            strVal += keyEvent.key
          }
        }
      } else if (keyEvent.key === '-') {
        if (strVal.startsWith('-')) strVal = strVal.replace('-', '')
        else strVal = '-' + strVal
      } else if (keyEvent.key === 'Backspace') {
        if (this.fractDigitsEdited) {
          this.fractPart = this.fractPart.length <= 1 ? '0' : this.fractPart.substring(0, this.fractPart.length - 1)
        } else {
          if (strVal.length === 2 && strVal.startsWith('-')) {
            strVal = '0'
          } else {
            strVal = strVal.length <= 1 ? '0' : strVal.substring(0, strVal.length - 1)
          }
        }
      } else if ([',', '.'].includes(keyEvent.key)) {
        if (this.precision > 0) {
          this.fractDigitsEdited = !this.fractDigitsEdited
        }
      }
      if (this.precision > 0) {
        strVal = strVal + '.' + this.fractPart
      }
      this.internalValue = Number(strVal)
    }
  },
  mounted () {
    const input = this.genTextInput()
    if (input) {
      input.setAttribute('type', 'text')
      input.style.textAlign = 'right'
    }
  },
  render () {
    const currentProps = Object.assign({}, this.$props)
    currentProps.value = this.computedValue
    if (currentProps.prefix) {
      currentProps.prefix = undefined
    }
    currentProps.appendIcon = 'mdi-calculator'
    return this.$createElement(VTextField, {
      props: currentProps,
      on: {
        keydown: this.keyProcess,
        'click:clear': this.clearValue,
        'click:append': this.activateCalculator
      }
    })
  }
})