import _ from 'lodash'

import { throttling } from '../utils.js'
import Earth from './earth'
import Stars from './stars'
import Wind from './wind'

const THREE = require('three')
require('../libs/CopyShader')
require('../libs/AfterimageShader')
require('../libs/EffectComposer')
require('../libs/RenderPass')
require('../libs/MaskPass')
require('../libs/ShaderPass')
require('../libs/AfterimagePass')

class App {
  constructor ({ app }) {
    this.afterimage = 0.98
    this.depth = 4000
    this.debounce = _.debounce(() => {
      this.startAfterImage()
    }, 100)
    this.sight = [160, 440]

    this.app = app

    this.width = app.clientWidth
    this.height = app.clientHeight

    this.scene = new THREE.Scene()
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      1,
      this.depth
    )
    this.group = new THREE.Group()
    this.afterimagePass = null
    this.composer = null

    this.throttlingDraw = () => {}

    this.earth = new Earth()
    this.stars = new Stars()
    this.wind = new Wind()

    this.init()
  }

  initApp () {
    const { app, renderer } = this

    for (let item of app.children) {
      app.removeChild(item)
      item.isAlive = false
    }
    renderer.domElement.isAlive = true
    app.appendChild(renderer.domElement)
  }

  init () {
    this.initCamera()
    this.initRenderer()
    this.initComposer()
    this.initLight()
    this.initThings()
    this.initAnimate()
    this.initApp()
  }

  initCamera () {
    this.camera.position.z = 200
  }

  initRenderer () {
    this.renderer.setSize(this.width, this.height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setClearColor(new THREE.Color(0x000000))
  }

  initComposer () {
    const { renderer, scene, camera, afterimage } = this

    this.composer = new THREE.EffectComposer(renderer)
    this.composer.addPass(new THREE.RenderPass(scene, camera))

    this.afterimagePass = new THREE.AfterimagePass(afterimage)
    this.afterimagePass.renderToScreen = true
    this.composer.addPass(this.afterimagePass)
    this.composer.setSize(this.width, this.height)
  }

  startAfterImage () {
    this.afterimagePass.uniforms.damp.value = this.afterimage
  }

  stopAfterImage () {
    this.afterimagePass.uniforms.damp.value = 0
  }

  initLight () {
    const { scene } = this

    const pointLight = new THREE.PointLight(0xffffff)
    pointLight.position.set(-400, 100, 150)
    scene.add(pointLight)

    const ambientLight = new THREE.AmbientLight(0x666666)
    scene.add(ambientLight)
  }

  initThings () {
    const { earth, wind, stars, group, scene } = this

    group.add(earth.group)
    group.add(wind.group)
    scene.add(stars.group)
    scene.add(group)

    group.rotateY(Math.PI * -0.15)
  }

  initAnimate () {
    const { wind, stars, composer } = this

    const draw = () => {
      wind.animate()
      stars.animate()
      composer.render()
    }
    this.throttlingDraw = throttling(draw)
  }

  animate () {
    const { renderer, animate } = this
    this.throttlingDraw()

    if (renderer.domElement.isAlive) {
      window.requestAnimationFrame(animate.bind(this))
    }
  }

  rotateScene (deltaX, deltaY) {
    this.stopAfterImage()

    this.group.rotation.y += deltaX / 300
    this.group.rotation.x += deltaY / 300
  }

  stopRotate () {
    this.startAfterImage()
  }

  resize () {
    this.width = this.app.clientWidth
    this.height = this.app.clientHeight

    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.stopAfterImage()
    this.debounce()

    this.renderer.setSize(this.width, this.height)
    this.composer.setSize(this.width, this.height)
  }

  zoomIn () {
    const { sight } = this
    if (this.camera.position.z > sight[0]) {
      this.camera.position.z -= 40
    }
    this.stopAfterImage()
    this.debounce()
  }

  zoomOut () {
    const { sight } = this
    if (this.camera.position.z < sight[1]) {
      this.camera.position.z += 40
    }
    this.stopAfterImage()
    this.debounce()
  }
}

export default App
