function setSyncInterval(callback) {
  const syncInterval = 1000 - new Date().getMilliseconds()
  setTimeout(() => {
    callback()
    setInterval(callback, 1000)
  }, syncInterval)
}

customElements.define(
  'digit-flip',
  class extends HTMLElement {
    static get observedAttributes() {
      return ['value']
    }

    constructor() {
      super()

      this.innerHTML = `
        <div class="digit">
          <span class="base"></span>
          <div class="flap over front"></div>
          <div class="flap over back"></div>
          <div class="flap under"></div>
        </div>`
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === null) {
        this.jumpTo(newValue)
      } else if (oldValue !== newValue) {
        this.flipTo(oldValue, newValue)
      }
    }

    jumpTo(value) {
      this.querySelector('.base').innerHTML = value
    }

    flipTo(oldValue, newValue) {
      this.querySelector('.front').setAttribute('data-content', oldValue)
      this.querySelector('.back').setAttribute('data-content', newValue)
      this.querySelector('.under').setAttribute('data-content', newValue)
      this.querySelector('.digit').classList.add('flipping')

      setTimeout(() => {
        this.querySelector('.base').innerHTML = newValue
        this.querySelector('.digit').classList.remove('flipping')
      }, 350)
    }
  }
)

customElements.define(
  'number-clock',
  class extends HTMLElement {
    connectedCallback() {
      const size = Number(this.getAttribute('size'))

      const digits = Array(size).fill(`<digit-flip value="0"></digit-flip>`).join('')

      this.innerHTML = `<div class="clock">${digits}</div>`

      setSyncInterval(() => this.update())
    }

    update() {
      const base = Number(this.getAttribute('base'))
      const size = Number(this.getAttribute('size'))
      const modulo = this.getAttribute('modulo') ? Number(this.getAttribute('modulo')) : undefined

      let now = Math.floor(new Date().getTime() / 1000)
      if (modulo !== undefined) {
        now = now % modulo
      }
      const digits = now.toString(base).padStart(size, '0').slice(-size)

      this.querySelectorAll('digit-flip').forEach((digit, index) => {
        digit.setAttribute('value', digits[index])
      })
    }
  }
)

customElements.define(
  'date-clock',
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<div class="clock">
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">-</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">-</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">&nbsp;&nbsp;</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">:</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">:</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
      </div>`

      setSyncInterval(() => this.update())
    }

    update() {
      const date = new Date().toISOString()
      const digits = date.replace(/[-:T]/g, '').slice(0, 14)

      this.querySelectorAll('digit-flip').forEach((digit, index) => {
        digit.setAttribute('value', digits[index])
      })
    }
  }
)

customElements.define(
  'countdown-clock',
  class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<div class="clock">
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">years&nbsp;</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">days</span>
        <span class="separator">&nbsp;</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">:</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
        <span class="separator">:</span>
        <digit-flip value="0"></digit-flip>
        <digit-flip value="0"></digit-flip>
      </div>`

      setSyncInterval(() => this.update())
    }

    update() {
      const lastDate = new Date(2147483647000)
      const currentDate = new Date()
      const lastTimestamp = lastDate.getTime()
      const currentTimestamp = currentDate.getTime()
      const diff = lastTimestamp - currentTimestamp + 1000 // Not sure why :shrug:

      const leapYears = [2024, 2028, 2032, 2036]
      const leapDays = leapYears.filter((year) => currentDate < new Date(`${year + 1}-01-01`))

      let years = lastDate.getFullYear() - currentDate.getFullYear()
      let days = (Math.floor(diff / 1000 / 60 / 60 / 24) - leapDays.length) % 365

      if (
        currentDate > new Date(`${currentDate.getFullYear()}-01-19T04:14:07`) &&
        leapYears.includes(currentDate.getFullYear())
      ) {
        days += 1
      }

      if (currentDate > new Date(`${currentDate.getFullYear()}-01-19T04:14:07`)) {
        years -= 1
      }

      years = String(years).padStart(2, '0')
      days = String(days).padStart(3, '0')

      const hours = String(Math.floor(diff / 1000 / 60 / 60) % 24).padStart(2, '0')
      const minutes = String(Math.floor(diff / 1000 / 60) % 60).padStart(2, '0')
      const seconds = String(Math.floor(diff / 1000) % 60).padStart(2, '0')

      let digits = `${years}${days}${hours}${minutes}${seconds}`

      if (diff < 0) {
        digits = '000000000000'
      }

      this.querySelectorAll('digit-flip').forEach((digit, index) => {
        digit.setAttribute('value', digits[index])
      })
    }
  }
)
