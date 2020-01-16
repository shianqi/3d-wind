import * as GeoTIFF from 'geotiff'
// import _ from 'lodash'
import { createLinearGradient } from 'color-mapper'
import { XYToLnglat, getVortex } from '../utils.js'
import tiffURL from '../img/merge.tiff'

import point from '../img/point.png' // TODO: 16 * 16

const THREE = require('three')

const vertexShader3D = `
  uniform float amplitude;
  uniform float radius;
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  void main() {
    vColor = customColor;
    vec2 xy = (vec2(90, 0) - vec2(position.y, position.x)) * (3.1415926 / 180.0);
    vec3 phPosition = radius * vec3(sin(xy.x) * cos(xy.y), cos(xy.x), sin(xy.x) * sin(xy.y));

    vec4 mvPosition = modelViewMatrix * vec4( phPosition, 1.0 );
    gl_PointSize = size * ( 300.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`
const fragmentShader = `
  uniform vec3 color;
  uniform sampler2D texture;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4( color * vColor, 1.0 );
    gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
  }
`

class Wind {
  constructor () {
    this.amount = 80000
    this.size = 1.5
    this.radius = 100
    this.friction = 0.68 // 摩擦力
    this.acceleration = 0.0002 // 加速效率
    this.colorMap = [
      [0.0, 'rgb(50, 50, 50)'],
      [0.2, 'rgb(55, 126, 247)'],
      [0.25, 'rgb(92, 201, 249)'],
      [0.3, 'rgb(117, 251, 253)'],
      [0.35, 'rgb(110, 227, 159)'],
      [0.4, 'rgb(125, 189, 68)'],
      [0.45, 'rgb(200, 230, 82)'],
      [0.5, 'rgb(254, 255, 145)'],
      [0.55, 'rgb(254, 255, 85)'],
      [0.6, 'rgb(248, 218, 73)'],
      [0.65, 'rgb(243, 179, 62)'],
      [0.7, 'rgb(238, 124, 48)'],
      [0.8, 'rgb(233, 51, 36)'],
      [0.9, 'rgb(187, 39, 26)'],
      [1.0, 'rgb(117, 21, 5)'],
    ]
    this.data = [[], []] // 风场数据
    this.data.width = 0
    this.data.height = 0

    this.index = 0

    this.colors = []
    this.group = new THREE.Group()
    this.sphere = null

    // 原始平面坐标
    this.positionX = new Float32Array(this.amount)
    this.positionY = new Float32Array(this.amount)

    // 速度
    this.velocityX = new Float32Array(this.amount)
    this.velocityY = new Float32Array(this.amount)

    this.init()
  }

  initColors () {
    const { colorMap } = this
    const gradient = createLinearGradient(0, 300) // TODO: 300
    colorMap.forEach(([position, color]) => {
      gradient.addColorStop(position, color)
    })
    this.colors = gradient
      .getAll()
      .map(item =>
        item.map((value, index) => (index === 3 ? value : value / 255))
      )
  }

  init () {
    this.loadWindData()
    this.initColors()
    this.addPoints()
  }

  async loadWindData () {
    const tiff = await GeoTIFF.fromUrl(tiffURL)
    const image = await tiff.getImage()
    this.data = await image.readRasters()
  }

  addPoints () {
    const { amount, size, colorMap } = this
    const vertex = new THREE.Vector3()
    const color = new THREE.Color(colorMap[0][1])

    const positionsArray = new Float32Array(amount * 3)
    const colors = new Float32Array(amount * 3)
    const sizes = new Float32Array(amount)

    const geometry = new THREE.BufferGeometry()

    for (let i = 0; i < amount; i++) {
      // positoins
      const x = Math.random() * 360
      const y = Math.random() * 180
      this.positionX[i] = x
      this.positionY[i] = y
      let pos = XYToLnglat({ x, y })

      vertex.x = pos.lng
      vertex.y = pos.lat
      vertex.z = 0
      vertex.toArray(positionsArray, i * 3)

      // colors
      color.toArray(colors, i * 3)

      // sizes
      sizes[i] = size
    }

    geometry.addAttribute(
      'position',
      new THREE.BufferAttribute(positionsArray, 3)
    )
    geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3))
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        radius: { value: this.radius },
        amplitude: { value: 1.0 },
        color: { value: new THREE.Color(0xffffff) },
        texture: { value: new THREE.TextureLoader().load(point) },
      },
      vertexShader: vertexShader3D,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      // depthTest: false,
      transparent: true,
    })

    this.sphere = new THREE.Points(geometry, material)
    this.group.add(this.sphere)
  }

  updatePoints () {
    const { amount, sphere, colors, data, friction, acceleration } = this
    const { position, customColor } = sphere.geometry.attributes
    const { width, height } = data

    for (let i = 0; i < amount; i++) {
      const i3 = i * 3
      const i3plus1 = i3 + 1
      const i3plus2 = i3 + 2

      // 更新平面坐标
      this.positionX[i] += this.velocityX[i]
      this.positionY[i] += this.velocityY[i]

      const xy = {
        x: this.positionX[i],
        y: this.positionY[i],
      }

      const u = getVortex(data[0], xy, width, height)
      const v = getVortex(data[1], xy, width, height)

      if (u != null && v != null) {
        // 更新每个点速度
        this.velocityX[i] *= friction
        this.velocityY[i] *= friction

        this.velocityX[i] += u * acceleration
        this.velocityY[i] -= v * acceleration

        // 将平面坐标转换为经纬度
        const lnglat = XYToLnglat(xy, width, height)

        position.array[i3] = lnglat.lng
        position.array[i3plus1] = lnglat.lat

        if (Math.random() < 0.01) {
          this.positionX[i] = Math.random() * 360
          this.positionY[i] = Math.random() * 180
        }
        position.needsUpdate = true

        // 更新颜色
        const speed = Math.floor(Math.sqrt(u * u + v * v))
        const color = colors[speed] || colors[300]

        customColor.array[i3] = color[0]
        customColor.array[i3plus1] = color[1]
        customColor.array[i3plus2] = color[2]

        customColor.needsUpdate = true
      } else {
        this.positionX[i] = Math.random() * 360
        this.positionY[i] = Math.random() * 180
      }
    }
  }

  animate () {
    this.updatePoints()
  }
}

export default Wind
