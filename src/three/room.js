import * as THREE from 'three'

// Procedural textures keep the scene asset-free
function noiseCanvas(size, base, spread) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = base + (Math.random() - 0.5) * spread
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

function floorTexture() {
  const c = noiseCanvas(1024, 40, 18)
  const ctx = c.getContext('2d')
  ctx.strokeStyle = 'rgba(0,0,0,.55)'
  ctx.lineWidth = 3
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(i * 256, 0); ctx.lineTo(i * 256, 1024); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * 256); ctx.lineTo(1024, i * 256); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function gradientTexture(stops) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  stops.forEach(([o, col]) => g.addColorStop(o, col))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 256)
  return new THREE.CanvasTexture(c)
}

function dotTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// Light cone from a projector lens to the four corners of what it projects on
function beam(apex, corners, opacity) {
  const pos = []
  const col = []
  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % 4]
    pos.push(...apex.toArray(), ...a.toArray(), ...b.toArray())
    col.push(1, 1, 1, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  const m = new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide, toneMapped: false, fog: false,
  })
  const mesh = new THREE.Mesh(g, m)
  mesh.userData.base = opacity
  return mesh
}

function projector(scale = 1) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9 * scale, 0.28 * scale, 0.66 * scale), new THREE.MeshStandardMaterial({ color: '#e2e2e2', roughness: 0.4, metalness: 0.2 }))
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 0.06, 24), new THREE.MeshBasicMaterial({ color: '#ffffff' }))
  lens.rotation.x = Math.PI / 2
  lens.position.set(0.22 * scale, 0, -0.35 * scale)
  const vent = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.04, 0.02), new THREE.MeshStandardMaterial({ color: '#111' }))
  vent.position.set(-0.1 * scale, -0.06 * scale, -0.335 * scale)
  g.add(body, lens, vent)
  g.userData.lens = lens
  return g
}

export function createRoom(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0d0d0d')
  scene.fog = new THREE.Fog('#0d0d0d', 22, 46)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)

  const W = 10, H = 6.4, zBack = -12, zFront = 16
  const L = zFront - zBack
  const zMid = (zBack + zFront) / 2
  const screenY = 2.7

  // glossy floor: slightly transparent so the mirrored screen below reads as a reflection
  const ft = floorTexture()
  ft.repeat.set(W / 4, L / 4)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ map: ft, roughness: 0.45, metalness: 0.2, transparent: true, opacity: 0.8 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.z = zMid
  floor.receiveShadow = true
  floor.renderOrder = 2
  scene.add(floor)

  // side walls, back wall, ceiling — walls slightly darker so projections read
  const wallMat = new THREE.MeshStandardMaterial({ color: '#8a8a8a', roughness: 0.92 })
  const left = new THREE.Mesh(new THREE.PlaneGeometry(L, H), wallMat)
  left.rotation.y = Math.PI / 2
  left.position.set(-W / 2, H / 2, zMid)
  left.receiveShadow = true
  const right = left.clone()
  right.rotation.y = -Math.PI / 2
  right.position.x = W / 2
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ color: '#070707', roughness: 1 }))
  back.position.set(0, H / 2, zBack)
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 1 }))
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, H, zMid)
  scene.add(left, right, back, ceiling)

  // glowing strips where the walls meet the floor
  const stripMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  ;[-1, 1].forEach((s) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, L), stripMat)
    strip.position.set(s * (W / 2 - 0.04), 0.03, zMid)
    scene.add(strip)
  })

  // screen: white frame, black inset, projected image
  const frame = new THREE.Mesh(new THREE.BoxGeometry(7.1, 4.12, 0.14), new THREE.MeshStandardMaterial({ color: '#ececec', roughness: 0.35 }))
  frame.position.set(0, screenY, zBack + 0.1)
  frame.castShadow = true
  const inset = new THREE.Mesh(new THREE.PlaneGeometry(6.66, 3.78), new THREE.MeshBasicMaterial({ color: '#111' }))
  inset.position.set(0, screenY, zBack + 0.175)
  const screenMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.656), screenMat)
  screen.position.set(0, screenY, zBack + 0.18)
  scene.add(frame, inset, screen)

  // reflection: the screen mirrored below the floor, fading with depth
  const mirrorMat = new THREE.MeshBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 0.55, toneMapped: false, side: THREE.DoubleSide,
    alphaMap: gradientTexture([[0, '#000'], [0.55, '#111'], [1, '#fff']]), depthWrite: false,
  })
  const mirror = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.656), mirrorMat)
  mirror.position.set(0, -screenY, zBack + 0.18)
  mirror.scale.y = -1
  mirror.renderOrder = 1
  scene.add(mirror)

  // the screen lights the floor in front of it
  const screenGlow = new THREE.PointLight('#ffffff', 22, 14, 1.6)
  screenGlow.position.set(0, 1.2, zBack + 1.6)
  scene.add(screenGlow)

  // main ceiling projector on a pole
  const projZ = zBack + 6
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, H - 4.6, 12), new THREE.MeshStandardMaterial({ color: '#050505' }))
  pole.position.set(0, H - (H - 4.6) / 2, projZ)
  const main = projector()
  main.position.set(0, 4.46, projZ)
  scene.add(pole, main)
  const mainLens = new THREE.Vector3(0.22, 4.46, projZ - 0.38)
  const sw = 3.25, sh = 1.828
  const mainBeam = beam(mainLens, [
    new THREE.Vector3(-sw, screenY + sh, zBack + 0.2), new THREE.Vector3(sw, screenY + sh, zBack + 0.2),
    new THREE.Vector3(sw, screenY - sh, zBack + 0.2), new THREE.Vector3(-sw, screenY - sh, zBack + 0.2),
  ], 0.085)
  scene.add(mainBeam)

  const spot = new THREE.SpotLight('#ffffff', 60, 18, 0.42, 0.7, 1.4)
  spot.position.copy(mainLens)
  spot.target.position.set(0, screenY, zBack)
  scene.add(spot, spot.target)

  // side walls get their own projectors and projected panels
  const wallZ = -4, wallY = 2.75, wallW = 6.4, wallH = 3.6
  const wallPanels = []
  const sideBeams = []
  ;[-1, 1].forEach((s) => {
    const panelMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false })
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), panelMat)
    panel.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2
    panel.position.set(s * (W / 2 - 0.02), wallY, wallZ)
    scene.add(panel)
    wallPanels.push(panel)

    const px = s * 1.7
    const sidePole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 10), pole.material)
    sidePole.position.set(px, H - 0.45, wallZ)
    const p = projector(0.75)
    p.position.set(px, H - 0.98, wallZ)
    p.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2 // lens faces its wall
    scene.add(sidePole, p)

    const lensPos = new THREE.Vector3(px + s * 0.27, H - 0.98, wallZ + 0.165 * s)
    const x = s * (W / 2 - 0.03)
    const b = beam(lensPos, [
      new THREE.Vector3(x, wallY + wallH / 2, wallZ - wallW / 2), new THREE.Vector3(x, wallY + wallH / 2, wallZ + wallW / 2),
      new THREE.Vector3(x, wallY - wallH / 2, wallZ + wallW / 2), new THREE.Vector3(x, wallY - wallH / 2, wallZ - wallW / 2),
    ], 0.06)
    b.material.opacity = 0
    scene.add(b)
    sideBeams.push(b)
  })

  // wall washes, moved toward the camera so the projected area stays dim
  ;[-1, 1].forEach((s) => {
    const wash = new THREE.SpotLight('#ffffff', 95, 16, 0.7, 1, 1.5)
    wash.position.set(s * 1.2, H - 0.3, zBack + 13)
    wash.target.position.set(s * (W / 2), 1.6, zBack + 11)
    scene.add(wash, wash.target)
    const deep = new THREE.SpotLight('#ffffff', 22, 10, 0.5, 1, 1.5)
    deep.position.set(s * 1.4, H - 0.3, zBack + 1.5)
    deep.target.position.set(s * (W / 2), 1.2, zBack + 0.4)
    scene.add(deep, deep.target)
  })

  // key light for stool shadows
  const key = new THREE.SpotLight('#ffffff', 80, 24, 0.6, 0.9, 1.3)
  key.position.set(0, H - 0.2, zBack + 9)
  key.target.position.set(0, 0, zBack + 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.bias = -0.0004
  scene.add(key, key.target)
  scene.add(new THREE.HemisphereLight('#ffffff', '#1a1a1a', 0.35))

  // felt stools
  const feltTex = new THREE.CanvasTexture(noiseCanvas(256, 150, 70))
  feltTex.colorSpace = THREE.SRGBColorSpace
  const stoolMat = new THREE.MeshStandardMaterial({ map: feltTex, color: '#9a9a9a', roughness: 1 })
  const stools = [[-2.6, -3.2, 0.36], [-0.9, -2.1, 0.4], [1.35, -3.3, 0.36], [2.25, -3.3, 0.36], [-3.2, -0.3, 0.5], [3.4, -0.6, 0.48], [-0.4, 1.6, 0.42]]
  stools.forEach(([x, z, r]) => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.6, 40), stoolMat)
    s.position.set(x, 0.3, zBack + 9 + z)
    s.castShadow = s.receiveShadow = true
    scene.add(s)
  })

  // dust drifting through the projector light
  const DUST = 700
  const dustPos = new Float32Array(DUST * 3)
  const dustSeed = new Float32Array(DUST)
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 8
    dustPos[i * 3 + 1] = Math.random() * 5.6 + 0.3
    dustPos[i * 3 + 2] = zBack + 0.5 + Math.random() * 13
    dustSeed[i] = Math.random() * Math.PI * 2
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.035, map: dotTexture(), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  }))
  scene.add(dust)

  // camera path: high above looking down the room → eye level facing the screen
  const posCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 15, 6),
    new THREE.Vector3(0, 9.5, 8),
    new THREE.Vector3(0, 4.2, 9.5),
    new THREE.Vector3(0, 2.15, 8.6),
  ])
  const lookCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 0.6, -4),
    new THREE.Vector3(0, 2.0, -9),
    new THREE.Vector3(0, 2.45, zBack),
  ])
  const look = new THREE.Vector3()
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  let progress = 0
  let power = 0 // 0 → 1 as the side projectors switch on
  let powerTarget = 0
  let flicker = 0

  const place = (time) => {
    const t = THREE.MathUtils.clamp(progress, 0, 1)
    posCurve.getPoint(t, camera.position)
    lookCurve.getPoint(t, look)
    // once landed, the cursor turns your head toward the walls
    const settle = THREE.MathUtils.smoothstep(t, 0.8, 1)
    camera.position.x += mouse.x * 0.7 * settle
    camera.position.y += (mouse.y * 0.3 + Math.sin(time * 0.0006) * 0.04) * settle
    look.x += mouse.x * 5.5 * settle
    look.y += mouse.y * 0.9 * settle
    camera.lookAt(look)
  }

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w / h < 1 ? 62 : 42
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  const onMove = (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // animated wall displays
  const displays = []
  const setDisplays = (list) => {
    list.forEach((d, i) => {
      const tex = new THREE.CanvasTexture(d.canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      wallPanels[i].material.map = tex
      wallPanels[i].material.needsUpdate = true
      displays.push({ d, tex })
    })
  }

  let running = false
  let raf = 0
  let lastDraw = 0
  const loop = (time) => {
    mouse.x += (mouse.tx - mouse.x) * 0.05
    mouse.y += (mouse.ty - mouse.y) * 0.05
    power += (powerTarget - power) * 0.06
    flicker *= 0.88

    // projector power-on with a little stutter
    const stutter = power > 0.02 && power < 0.9 ? (Math.random() > 0.8 ? 0.4 : 1) : 1
    const level = power * stutter * (1 - flicker * 0.85)
    wallPanels.forEach((p) => { p.material.opacity = level })
    sideBeams.forEach((b) => { b.material.opacity = b.userData.base * level })
    mainBeam.material.opacity = mainBeam.userData.base * (1 - flicker * 0.7) * (0.9 + Math.sin(time * 0.004) * 0.1)

    if (time - lastDraw > 33) {
      displays.forEach(({ d, tex }) => { d.draw(time); tex.needsUpdate = true })
      lastDraw = time
    }

    const arr = dustGeo.attributes.position.array
    for (let i = 0; i < DUST; i++) {
      arr[i * 3 + 1] += 0.0016 + Math.sin(time * 0.0004 + dustSeed[i]) * 0.0012
      arr[i * 3] += Math.cos(time * 0.0003 + dustSeed[i]) * 0.0012
      if (arr[i * 3 + 1] > 5.9) arr[i * 3 + 1] = 0.3
    }
    dustGeo.attributes.position.needsUpdate = true

    place(time)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }

  const textures = []
  return {
    setProgress(p) { progress = p },
    setActive(on) {
      if (on && !running) { running = true; resize(); raf = requestAnimationFrame(loop) }
      if (!on && running) { running = false; cancelAnimationFrame(raf) }
    },
    setPower(on) { powerTarget = on ? 1 : 0 },
    flicker() { flicker = 1 },
    setDisplays,
    setScreen(canvasEl) {
      const tex = new THREE.CanvasTexture(canvasEl)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
      textures.push(tex)
      screenMat.map = tex
      screenMat.needsUpdate = true
      mirrorMat.map = tex
      mirrorMat.needsUpdate = true
    },
    screenMaterial: screenMat,
    renderOnce() { place(performance.now()); renderer.render(scene, camera) },
    dispose() {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      textures.forEach((t) => t.dispose())
      displays.forEach(({ tex }) => tex.dispose())
      scene.traverse((o) => {
        o.geometry?.dispose()
        if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.alphaMap?.dispose(); m.dispose() })
      })
      renderer.dispose()
    },
  }
}
