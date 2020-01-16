import WheelIndicator from 'wheel-indicator'

class AppEventListener {
  constructor (app) {
    this.mouseDown = false
    this.mouseX = 0
    this.mouseY = 0
    this.app = app
    this.container = app.app

    this.indicator = new WheelIndicator({
      elem: this.container,
      callback: this.onWheelUpOrDown.bind(this),
    })
    this.init()
  }

  init () {
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false)
    document.addEventListener('mousedown', this.onMouseDown.bind(this), false)
    document.addEventListener('mouseup', this.onMouseUp.bind(this), false)
    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }

  onMouseMove (e) {
    e.preventDefault()

    const { mouseDown, mouseX, mouseY } = this

    if (!mouseDown) return

    const deltaX = e.clientX - mouseX
    const deltaY = e.clientY - mouseY
    this.mouseX = e.clientX
    this.mouseY = e.clientY
    this.app.rotateScene(deltaX, deltaY)
  }

  onMouseDown (e) {
    e.preventDefault()

    this.mouseDown = true
    this.mouseX = e.clientX
    this.mouseY = e.clientY
  }

  onMouseUp (e) {
    e.preventDefault()

    this.app.stopRotate()
    this.mouseDown = false
  }

  onWindowResize () {
    this.app.resize()
  }

  onWheelUpOrDown (e) {
    const { direction } = e

    if (direction === 'up') {
      this.app.zoomIn()
    } else {
      this.app.zoomOut()
    }
  }
}

export default AppEventListener
