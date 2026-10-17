import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { ATTENUATION, linearLuminance, MAX_THICKNESS_MM, MIN_THICKNESS_MM, thicknessForLuminance } from './lithophane-simulation'
export type LithoSceneOptions = { photo: string; width: number; height: number; shape: string; zoom: number; lit: boolean }
const shaderTypes = { backlight: { value: 0 }, attenuation: { value: ATTENUATION } }
function outline(width: number, height: number, arch: boolean) {
  const s = new THREE.Shape(), x = width / 2, y = height / 2
  s.moveTo(-x, -y); s.lineTo(x, -y)
  if (arch) { s.lineTo(x, y - x); s.absarc(0, y - x, x, 0, Math.PI, false) } else { s.lineTo(x, y); s.lineTo(-x, y) }
  s.lineTo(-x, -y)
  return s
}
function woodTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 256
  const ctx = canvas.getContext('2d')!, image = ctx.createImageData(512, 256)
  let random = 31
  for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) {
    random = (random * 16807) % 2147483647
    const grain = Math.sin(y * .83 + Math.sin(x * .013) * 1.8) * 5 + Math.sin(y * 2.51 + Math.sin(x * .023)) * 3 + (random / 2147483647 - .5) * 9
    const i = (y * 512 + x) * 4; image.data[i] = 174 + grain; image.data[i + 1] = 132 + grain; image.data[i + 2] = 83 + grain; image.data[i + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = false; return texture
}
function studioBackdrop() {
  const path = [{ y: 0, z: 65 }, { y: 0, z: -10 }]
  for (let i = 1; i <= 40; i++) { const angle = i / 40 * Math.PI / 2; path.push({ y: 12 * (1 - Math.cos(angle)), z: -10 - 12 * Math.sin(angle) }) }
  path.push({ y: 70, z: -22 })
  const positions: number[] = [], indices: number[] = []
  path.forEach((point, i) => { positions.push(-90, point.y, point.z, 90, point.y, point.z); if (i < path.length - 1) { const n = i * 2; indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2) } })
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry
}
function contactTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128
  const ctx = canvas.getContext('2d')!, gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64)
  gradient.addColorStop(0, '#00000090'); gradient.addColorStop(.45, '#00000044'); gradient.addColorStop(1, '#00000000')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128); const texture = new THREE.CanvasTexture(canvas); texture.flipY = false; return texture
}
function disposeGroup(group: THREE.Group) {
  group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return
    object.geometry.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach(material => { for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose(); material.dispose() })
  })
  group.clear()
}
export class LithophaneScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(34, 1, .1, 150)
  model = new THREE.Group()
  key = new THREE.DirectionalLight('#fff6e8', 3.2)
  fill = new THREE.DirectionalLight('#dfe7f4', .9)
  ambient = new THREE.HemisphereLight('#fff9eb', '#9a8264', 1.1)
  back = new THREE.PointLight('#ffd89b', 0, 40, 2)
  uniforms = { backlight: { ...shaderTypes.backlight }, attenuation: { ...shaderTypes.attenuation } }
  floor: THREE.Mesh
  contact: THREE.Mesh
  light = 1
  targetLight = 1
  orbit = .14
  height = 15
  width = 10
  private revision = 0
  private source = ''
  private disposed = false
  constructor(canvas: HTMLCanvasElement, pixelRatio = Math.min(devicePixelRatio, 1.7)) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' })
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.15
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.scene.add(this.model, this.ambient, this.key, this.fill, this.back)
    this.key.position.set(-12, 23, 17); this.fill.position.set(13, 10, 10)
    this.key.castShadow = true; this.key.shadow.mapSize.set(1024, 1024)
    Object.assign(this.key.shadow.camera, { left: -16, right: 16, top: 24, bottom: -12, near: .5, far: 80 })
    this.key.shadow.normalBias = .02; this.key.shadow.bias = -.00015; this.key.shadow.radius = 4
    this.floor = new THREE.Mesh(studioBackdrop(), new THREE.MeshStandardMaterial({ color: '#d6cfc3', roughness: .96 }))
    this.floor.position.y = -.025; this.floor.receiveShadow = true; this.scene.add(this.floor)
    this.contact = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), new THREE.MeshBasicMaterial({ map: contactTexture(), transparent: true, depthWrite: false, opacity: .45 }))
    this.contact.rotation.x = -Math.PI / 2; this.contact.position.y = -.01; this.scene.add(this.contact)
    this.scene.background = new THREE.Color('#282725')
  }
  resize(width: number, height: number) {
    this.renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    this.camera.aspect = width / Math.max(height, 1); this.camera.updateProjectionMatrix()
  }
  async configure(options: LithoSceneOptions) {
    this.targetLight = options.lit ? 1 : 0
    const source = [options.photo, options.width, options.height, options.shape, options.zoom].join('|')
    if (source === this.source) return
    const revision = ++this.revision
    const image = new Image(); image.decoding = 'async'; image.src = options.photo; await image.decode()
    if (this.disposed || revision !== this.revision) return
    this.source = source; this.width = options.width; this.height = options.height
    const tw = 512, th = Math.round(512 * options.height / options.width)
    const photo = document.createElement('canvas'); photo.width = tw; photo.height = th
    const context = photo.getContext('2d', { willReadFrequently: true })!
    context.fillStyle = '#fff'; context.fillRect(0, 0, tw, th)
    const scale = Math.max(tw / image.naturalWidth, th / image.naturalHeight) * options.zoom
    context.drawImage(image, (tw - image.naturalWidth * scale) / 2, (th - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale)
    const pixels = context.getImageData(0, 0, tw, th), data = new Float32Array(tw * th)
    for (let i = 0; i < data.length; i++) data[i] = thicknessForLuminance(linearLuminance(pixels.data[i * 4], pixels.data[i * 4 + 1], pixels.data[i * 4 + 2]))
    const thicknessImage = context.createImageData(tw, th)
    for (let i = 0; i < data.length; i++) {
      const encoded = (data[i] - MIN_THICKNESS_MM) / (MAX_THICKNESS_MM - MIN_THICKNESS_MM) * 255
      // Pre-flip data so texture uploads keep WebGL's FLIP_Y state off.
      // Shadow texture arrays in current Three.js require that state.
      const output = ((th - 1 - Math.floor(i / tw)) * tw + i % tw) * 4
      thicknessImage.data[output] = encoded; thicknessImage.data[output + 1] = encoded; thicknessImage.data[output + 2] = encoded; thicknessImage.data[output + 3] = 255
    }
    context.putImageData(thicknessImage, 0, 0)
    const thicknessMap = new THREE.CanvasTexture(photo); thicknessMap.colorSpace = THREE.NoColorSpace; thicknessMap.flipY = false; thicknessMap.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy())
    const w = options.width, h = options.height, arch = options.shape === 'arch'
    const geometry = new THREE.PlaneGeometry(w, h, 192, Math.round(192 * h / w))
    const positions = geometry.attributes.position, uv = geometry.attributes.uv
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i), cap = h / 2 - w / 2 + Math.sqrt(Math.max(0, w * w / 4 - px * px))
      const py = arch ? Math.min(positions.getY(i), cap) : positions.getY(i)
      positions.setY(i, py); uv.setY(i, (py + h / 2) / h)
      const ix = Math.min(tw - 1, Math.max(0, Math.round(uv.getX(i) * (tw - 1))))
      const iy = Math.min(th - 1, Math.max(0, Math.round((1 - uv.getY(i)) * (th - 1))))
      let thickness = 0, count = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { thickness += data[Math.max(0, Math.min(th - 1, iy + dy)) * tw + Math.max(0, Math.min(tw - 1, ix + dx))]; count++ }
      positions.setZ(i, thickness / count / 10)
    }
    positions.needsUpdate = true; uv.needsUpdate = true; geometry.computeVertexNormals()
    const frontMaterial = new THREE.MeshPhysicalMaterial({ color: '#f1eee5', roughness: .86, metalness: 0, bumpMap: thicknessMap, bumpScale: .007, side: THREE.DoubleSide })
    frontMaterial.onBeforeCompile = shader => {
      shader.uniforms.uThicknessMap = { value: thicknessMap }
      shader.uniforms.uBacklight = this.uniforms.backlight
      shader.uniforms.uAttenuation = this.uniforms.attenuation
      shader.fragmentShader = 'uniform sampler2D uThicknessMap; uniform float uBacklight; uniform float uAttenuation;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float thicknessMM = ${MIN_THICKNESS_MM.toFixed(2)} + texture2D(uThicknessMap, vBumpMapUv).r * ${(MAX_THICKNESS_MM - MIN_THICKNESS_MM).toFixed(2)};
        float transmission = exp(-uAttenuation * thicknessMM);
        float layers = 0.988 + 0.012 * sin(vBumpMapUv.y * ${Math.round(h / .016)}.0 * 6.2831853);
        totalEmissiveRadiance += vec3(1.0, 0.94, 0.82) * transmission * uBacklight * layers;
      `)
    }
    const next = new THREE.Group()
    const front = new THREE.Mesh(geometry, frontMaterial); front.castShadow = true; front.receiveShadow = true; next.add(front)
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(outline(w, h, arch), { depth: .065, bevelEnabled: false, curveSegments: 48 }), new THREE.MeshStandardMaterial({ color: '#ebe7db', roughness: .9 }))
    back.position.z = -.065; back.castShadow = true; next.add(back)
    const border = outline(w + .26, h + .26, arch)
    const inner = outline(w - .04, h - .04, arch)
    border.holes.push(new THREE.Path(inner.getPoints(64).reverse()))
    const frame = new THREE.Mesh(new THREE.ExtrudeGeometry(border, { depth: .16, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018, curveSegments: 64 }), new THREE.MeshStandardMaterial({ color: '#f6f0e2', roughness: .8 }))
    frame.castShadow = true; next.add(frame)
    const wood = woodTexture()
    const base = new THREE.Mesh(new RoundedBoxGeometry(w + 1.5, .82, 2.8, 4, .12), new THREE.MeshStandardMaterial({ color: '#ffffff', map: wood, roughness: .72, bumpMap: wood, bumpScale: .009 }))
    base.position.set(0, -h / 2 - .35, .05); base.castShadow = true; base.receiveShadow = true; next.add(base)
    const slot = new THREE.Mesh(new THREE.BoxGeometry(w + .05, .035, .45), new THREE.MeshStandardMaterial({ color: '#7d6445', roughness: .95 }))
    slot.position.set(0, -h / 2 + .071, .1); next.add(slot)
    disposeGroup(this.model); this.model.add(next); this.model.position.set(0, h / 2 + .8, 0)
    this.contact.scale.x = (w + 4) / 16
    this.key.target.position.set(0, h / 2, 0); this.scene.add(this.key.target)
    this.back.position.set(0, h * .5 + .8, -1.1)
  }
  render(immediate = false) {
    if (this.disposed) return
    this.light = immediate ? this.targetLight : THREE.MathUtils.lerp(this.light, this.targetLight, .13)
    this.uniforms.backlight.value = this.light * 4.1
    this.ambient.intensity = THREE.MathUtils.lerp(.85, .085, this.light)
    this.key.intensity = THREE.MathUtils.lerp(3.0, .24, this.light)
    this.fill.intensity = THREE.MathUtils.lerp(.65, .035, this.light)
    this.back.intensity = this.light * 60
    ;(this.scene.background as THREE.Color).lerpColors(new THREE.Color('#d9d5cd'), new THREE.Color('#252420'), this.light)
    const distance = (this.height + 2) / (2 * Math.tan(THREE.MathUtils.degToRad(17))) * 1.18
    this.camera.position.set(Math.sin(this.orbit) * distance, this.height * .56 + 1.3, Math.cos(this.orbit) * distance)
    this.camera.lookAt(0, this.height * .5 + .7, 0)
    this.renderer.render(this.scene, this.camera)
    this.renderer.domElement.dataset.backlight = this.light > .5 ? 'on' : 'off'
  }
  dispose() {
    this.disposed = true; ++this.revision
    disposeGroup(this.model)
    this.floor.geometry.dispose(); (this.floor.material as THREE.Material).dispose()
    this.contact.geometry.dispose(); const material = this.contact.material as THREE.MeshBasicMaterial; material.map?.dispose(); material.dispose()
    this.renderer.dispose()
    // React Strict Mode can reuse this canvas immediately after cleanup.
    // Release a context only after the canvas really leaves the document.
    queueMicrotask(() => { if (!this.renderer.domElement.isConnected) this.renderer.forceContextLoss() })
  }
}
