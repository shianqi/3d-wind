export const getVortex = (spead, { x, y }, width = 360, height = 180) => {
  const X = Math.floor(x)
  const Y = Math.floor(y)
  const index = Y * width + X

  return spead ? spead[index] : null
}

export const XYToLnglat = ({ x, y }, width = 360, height = 180) => {
  let lng = (x - 180) / width * 360
  let lat = (y * -1 + 90) / height * 180

  // let lng = x / width * 360 - 180
  // let lat = y / height * 180 - 90
  return { lng, lat }
}

// 经纬度转平面坐标
export const lnglatToXY = ({ lng, lat }, width, height) => {
  let x = (lng + 180) / 360 * width
  let y = (lat * -1 + 90) / 180 * height

  // let x = (lng + 180) / 360 * width
  // let y = (lat + 90) / 180 * height
  return { x, y }
}

// 经纬度转球面坐标
export const lnglatToXYZ = ({ lng, lat }, r) => {
  var phi = (90 - lat) * Math.PI / 180
  var theta = -1 * lng * Math.PI / 180
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  }
}

export const throttling = (func) => {
  let counter = 0
  return () => {
    counter += 1
    if (counter % 2 === 0) {
      func()
    }
  }
}
