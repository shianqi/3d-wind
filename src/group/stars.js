import * as THREE from 'three'
import spark from '../img/light_alpha.png'

class Stars {
  constructor () {
    this.total = 300
    this.starSize = 700

    this.group = new THREE.Group()
    this.size = []
    this.sprites = []

    this.init()
  }

  init () {
    let { total } = this

    let spriteMap = new THREE.TextureLoader().load(spark)
    let material = new THREE.SpriteMaterial({
      map: spriteMap,
      color: 0xffffff,
    })

    for (let i = 0; i < total; i++) {
      let p = this.point()
      let sprite = new THREE.Sprite(material)
      sprite.position.set(p.x, p.y, p.z)
      this.group.add(sprite)

      const scale = Math.random() * 6
      sprite.scale.set(scale, scale, scale)

      this.size[i] = scale * 10
      this.sprites[i] = sprite
    }
  }

  point () {
    const { starSize } = this

    return {
      x: (Math.random() - 0.5) * starSize * 2,
      y: (Math.random() - 0.5) * starSize,
      z: -(Math.random() * 300) - 100,
    }
  }

  animate () {
    const { total, size } = this

    for (let i = 0; i < total; i++) {
      const scale = Math.sin(new Date().valueOf() / 1000 + size[i]) * 10 + size[i] * 0.08
      this.sprites[i].scale.set(scale, scale, scale)
    }
  }
}

export default Stars
