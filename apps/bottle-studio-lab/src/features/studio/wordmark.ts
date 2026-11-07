import * as THREE from "three"

export function createWordmarkTexture(
  text: string,
  scale: number
): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  ctx.clearRect(0, 0, size, size)
  const fontSize = Math.round(56 * scale)
  ctx.font = `600 ${fontSize}px system-ui, Segoe UI, Roboto, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "rgba(35, 32, 28, 0.88)"
  ctx.shadowColor = "rgba(255,255,255,0.35)"
  ctx.shadowBlur = 4
  const label = text.trim() || " "
  ctx.fillText(label, size / 2, size / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function createWordmarkPlane(
  text: string,
  scale: number,
  bottleRadius: number,
  midHeight: number
): THREE.Mesh {
  const texture = createWordmarkTexture(text, scale)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
  const width = bottleRadius * 1.1
  const height = width * 0.28
  const geo = new THREE.PlaneGeometry(width, height)
  const mesh = new THREE.Mesh(geo, material)
  mesh.position.set(bottleRadius * 1.02, midHeight * 0.55, 0)
  mesh.rotation.y = 0
  return mesh
}
