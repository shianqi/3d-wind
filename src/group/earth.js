import earth from '../img/earth.jpg'
import bump from '../img/bump.jpeg'
import spec from '../img/spec.jpeg'

const THREE = require('three')

class Earth {
  constructor () {
    this.radius = 100
    this.group = null
    this.center = {
      x: 0,
      y: 0,
      z: 0,
    }

    this.init()
  }

  init () {
    const { center } = this
    const earthTexture = new THREE.TextureLoader().load(earth)
    const earthBump = new THREE.TextureLoader().load(bump)
    const earthSpecular = new THREE.TextureLoader().load(spec)
    const earthGeometry = new THREE.SphereGeometry(this.radius, 32, 32) // new THREE.SphereGeometry(radius, 128, 128),
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 100,
      bumpScale: 1,
      bumpMap: earthBump,
      specularMap: earthSpecular,
    })
    let earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)

    earthMesh.position.set(center.x, center.y, center.z)
    earthMesh.rotateY(Math.PI * 1)
    this.group = earthMesh
  }
}

export default Earth
