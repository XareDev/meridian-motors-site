// Meridian Motors — interactive 3D hero: car on a raised pedestal, camera orbiting around it
// inside an underground garage. Camera orbits the car (the car itself never rotates).
(function () {
  const mount = document.getElementById("hero-3d");
  const canvas = document.getElementById("hero-3d-canvas");
  if (!mount || !canvas || typeof THREE === "undefined") return;

  const CAR_URL = "models/gmc-canyon-at4x.glb";
  const GARAGE_URL = "models/garage.glb";

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0b0d, 0.045);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // r128 uses outputEncoding, not outputColorSpace — the previous build was silently
  // rendering in the wrong color space, which is a big part of why it looked flat/unreal.
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ============ Image-based lighting (this is what actually sells "photoreal") ============
  let envRT = null;
  if (THREE.PMREMGenerator) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envScene = THREE.RoomEnvironment ? new THREE.RoomEnvironment() : null;
    if (envScene) {
      envRT = pmrem.fromScene(envScene, 0.035);
      scene.environment = envRT.texture;
    }
    pmrem.dispose();
  }

  // ============ Showcase lighting ============
  const hemi = new THREE.HemisphereLight(0x3b4658, 0x08090a, 0.35);
  scene.add(hemi);

  const garageFill = new THREE.PointLight(0x8fa3c8, 18, 34, 2);
  garageFill.position.set(0, 6, -4);
  scene.add(garageFill);

  const ceilingFills = [
    { pos: [-6, 5.6, -3], color: 0xdfe8ff, intensity: 6 },
    { pos: [6, 5.6, -3], color: 0xdfe8ff, intensity: 6 },
    { pos: [-6, 5.6, 4], color: 0xdfe8ff, intensity: 4.5 },
    { pos: [6, 5.6, 4], color: 0xdfe8ff, intensity: 4.5 },
  ];
  ceilingFills.forEach(({ pos, color, intensity }) => {
    const l = new THREE.PointLight(color, intensity, 14, 2);
    l.position.set(pos[0], pos[1], pos[2]);
    scene.add(l);
  });

  const carLights = new THREE.Group();

  const spot = new THREE.SpotLight(0xfff4e0, 34, 16, Math.PI / 6.2, 0.45, 1.6);
  spot.position.set(0, 6.4, 0.6);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  spot.shadow.camera.near = 1;
  spot.shadow.camera.far = 14;
  spot.shadow.bias = -0.0012;
  spot.shadow.radius = 4;
  carLights.add(spot);
  const spotTarget = new THREE.Object3D();
  spotTarget.position.set(0, 0.6, 0);
  carLights.add(spotTarget);
  spot.target = spotTarget;

  const key = new THREE.DirectionalLight(0xbcd0ff, 0.9);
  key.position.set(4, 3, 5);
  carLights.add(key);
  const rimLight = new THREE.DirectionalLight(0xff9a4d, 1.4);
  rimLight.position.set(-5, 2.5, -4);
  carLights.add(rimLight);

  const bounce = new THREE.PointLight(0xffe8cf, 3.5, 6, 2);
  bounce.position.set(0, 0.35, 1.4);
  carLights.add(bounce);

  scene.add(carLights);

  // ============ Pedestal the car sits on (this is the "uplift") ============
  const discRadius = 1.9;
  const pedestalGroup = new THREE.Group();
  let pedestalHeight = 0.32;

  const riser = new THREE.Mesh(
    new THREE.CylinderGeometry(discRadius * 0.86, discRadius * 0.98, 1, 48),
    new THREE.MeshStandardMaterial({ color: 0x18171a, roughness: 0.45, metalness: 0.5, envMapIntensity: 0.8 })
  );
  riser.castShadow = true;
  riser.receiveShadow = true;
  pedestalGroup.add(riser);

  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(discRadius, discRadius, 0.04, 64),
    new THREE.MeshStandardMaterial({ color: 0x141312, roughness: 0.28, metalness: 0.75, envMapIntensity: 1.1 })
  );
  disc.receiveShadow = true;
  disc.castShadow = false;
  pedestalGroup.add(disc);

  const discRim = new THREE.Mesh(
    new THREE.TorusGeometry(discRadius, 0.012, 8, 64),
    new THREE.MeshStandardMaterial({ color: 0xd97a3a, roughness: 0.35, metalness: 0.75, emissive: 0x3a1f0c, emissiveIntensity: 0.5 })
  );
  discRim.rotation.x = Math.PI / 2;
  pedestalGroup.add(discRim);

  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(discRadius * 1.35, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.003;
  pedestalGroup.add(contactShadow);

  const rig = new THREE.Group();
  rig.add(pedestalGroup);
  scene.add(rig);

  const garageGroup = new THREE.Group();
  scene.add(garageGroup);

  const camTarget = new THREE.Vector3(0, 1, 0);
  let baseRadius = 6;
  let minRadius = 3.2;
  let maxRadius = 9;
  let minPolar = Math.PI * 0.28;
  let maxPolar = Math.PI * 0.52;

  function placeCar(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    object.position.x -= center.x;
    object.position.z -= center.z;

    pedestalHeight = Math.max(0.22, size.y * 0.16);
    riser.scale.y = pedestalHeight;
    riser.position.y = pedestalHeight / 2;
    disc.position.y = pedestalHeight;
    discRim.position.y = pedestalHeight + 0.021;

    object.position.y -= box.min.y;
    object.position.y += pedestalHeight;

    const maxDim = Math.max(size.x, size.z);
    const fitOffset = 1.35;
    const fov = camera.fov * (Math.PI / 180);
    baseRadius = (Math.max(maxDim, size.y * 1.4) / 2) / Math.tan(fov / 2) * fitOffset;

    camTarget.set(0, pedestalHeight + size.y * 0.42, 0);
    spotTarget.position.set(0, pedestalHeight + size.y * 0.2, 0);

    return { size, center };
  }

  function placeGarage(garageScene, carSize) {
    const box = new THREE.Box3().setFromObject(garageScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const desiredHeight = carSize.y * 3.6;
    const scale = desiredHeight / size.y;
    garageScene.scale.setScalar(scale);

    garageScene.position.x = -center.x * scale;
    garageScene.position.z = -center.z * scale;
    garageScene.position.y = -box.min.y * scale;

    garageScene.traverse((n) => {
      if (n.isMesh) {
        n.castShadow = false;
        n.receiveShadow = true;
        if (n.material) n.material.fog = true;
      }
    });

    garageScene.updateMatrixWorld(true);
    const footprint = Math.max(size.x, size.z) * scale;
    return detectPillarCage(garageScene, footprint, carSize);
  }

  function detectPillarCage(garageScene, footprint, carSize) {
    const candidates = [];
    const box3 = new THREE.Box3();
    garageScene.traverse((n) => {
      if (!n.isMesh || !n.geometry) return;
      if (!n.geometry.boundingBox) n.geometry.computeBoundingBox();
      box3.copy(n.geometry.boundingBox).applyMatrix4(n.matrixWorld);
      const s = new THREE.Vector3();
      const c = new THREE.Vector3();
      box3.getSize(s);
      box3.getCenter(c);
      const horiz = Math.max(s.x, s.z);
      const isTallAndThin = s.y > carSize.y * 1.6 && horiz < footprint * 0.22 && horiz > 0.01;
      const isNearCenter = Math.hypot(c.x, c.z) < footprint * 0.65;
      if (isTallAndThin && isNearCenter) candidates.push({ x: c.x, z: c.z, h: s.y });
    });

    if (!candidates.length) return null;

    const clusterDist = Math.max(footprint * 0.06, 0.3);
    const clusters = [];
    candidates.forEach((p) => {
      let cluster = clusters.find((c) => Math.hypot(c.x - p.x, c.z - p.z) < clusterDist);
      if (cluster) {
        cluster.x = (cluster.x * cluster.n + p.x) / (cluster.n + 1);
        cluster.z = (cluster.z * cluster.n + p.z) / (cluster.n + 1);
        cluster.n += 1;
      } else {
        clusters.push({ x: p.x, z: p.z, n: 1 });
      }
    });

    if (clusters.length < 4) return null;

    function centroidOf(pts) {
      const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
      const cz = pts.reduce((a, p) => a + p.z, 0) / pts.length;
      return { x: cx, z: cz };
    }
    function spreadOf(pts, c) {
      const dists = pts.map((p) => Math.hypot(p.x - c.x, p.z - c.z));
      const mean = dists.reduce((a, d) => a + d, 0) / dists.length;
      const variance = dists.reduce((a, d) => a + (d - mean) * (d - mean), 0) / dists.length;
      return { variance, mean };
    }

    let best = null;
    const pool = clusters.slice(0, 10);
    function combinations(arr, k, start, chosen, out) {
      if (chosen.length === k) { out.push(chosen.slice()); return; }
      for (let i = start; i < arr.length; i++) {
        chosen.push(arr[i]);
        combinations(arr, k, i + 1, chosen, out);
        chosen.pop();
      }
    }
    const combos = [];
    combinations(pool, 4, 0, [], combos);
    combos.forEach((combo) => {
      const c = centroidOf(combo);
      const { variance, mean } = spreadOf(combo, c);
      const score = variance / Math.max(mean, 0.01);
      if (!best || score < best.score) best = { score, center: c, radius: mean };
    });

    if (!best || best.radius < carSize.y * 0.6) return null;
    return { center: best.center, radius: best.radius };
  }

  function setLoading(pct) {
    mount.dataset.pct = pct + "%";
  }
  mount.dataset.pct = "0%";
  mount.classList.add("is-loading");

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  function loadModel(url, onProgress) {
    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), onProgress, reject);
    });
  }

  let carModel = null;
  let garageModel = null;
  const progress = { car: 0, garage: 0 };
  function reportProgress() {
    setLoading(Math.min(100, Math.round((progress.car + progress.garage) / 2)));
  }

  Promise.all([
    loadModel(CAR_URL, (xhr) => {
      if (xhr.lengthComputable) {
        progress.car = Math.round((xhr.loaded / xhr.total) * 100);
        reportProgress();
      }
    }),
    loadModel(GARAGE_URL, (xhr) => {
      if (xhr.lengthComputable) {
        progress.garage = Math.round((xhr.loaded / xhr.total) * 100);
        reportProgress();
      }
    }),
  ])
    .then(([car, garage]) => {
      carModel = car;
      carModel.traverse((n) => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = false;
          if (n.material && "envMapIntensity" in n.material) n.material.envMapIntensity = 1.15;
        }
      });
      pedestalGroup.add(carModel);
      const { size } = placeCar(carModel);

      garageModel = garage;
      const cage = placeGarage(garageModel, size);
      garageGroup.add(garageModel);

      if (cage) {
        rig.position.set(cage.center.x, 0, cage.center.z);
        camTarget.x = cage.center.x;
        camTarget.z = cage.center.z;
        const clearance = Math.max(size.x, size.z) * 0.6;
        maxRadius = Math.max(cage.radius - clearance, baseRadius * 0.9);
        maxRadius = Math.min(maxRadius, cage.radius * 0.92);
        minRadius = Math.min(baseRadius * 0.85, maxRadius * 0.7);
        if (minRadius > maxRadius) minRadius = maxRadius * 0.7;
      } else {
        minRadius = baseRadius * 0.85;
        maxRadius = baseRadius * 1.6;
      }
      radius = THREE.MathUtils.clamp(baseRadius, minRadius, maxRadius);
      targetRadius = radius;

      mount.classList.remove("is-loading");
      mount.classList.add("is-ready");
    })
    .catch((err) => {
      console.error("Hero 3D scene failed to load:", err);
      mount.classList.remove("is-loading");
      mount.classList.add("is-error");
    });

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ============ Interaction — the camera orbits the car; the car itself never rotates ============
  let dragging = false;
  let lastX = 0, lastY = 0;
  let azimuth = 0.5, targetAzimuth = 0.5;
  let polar = Math.PI * 0.42, targetPolar = Math.PI * 0.42;
  let radius = baseRadius, targetRadius = baseRadius;
  let autoSpin = true;
  let resumeTimer = null;

  function pointerDown(e) {
    dragging = true;
    autoSpin = false;
    clearTimeout(resumeTimer);
    lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    lastY = (e.touches ? e.touches[0].clientY : e.clientY);
  }
  function pointerMove(e) {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dx = x - lastX;
    const dy = y - lastY;
    lastX = x; lastY = y;
    targetAzimuth += dx * 0.008;
    targetPolar = THREE.MathUtils.clamp(targetPolar - dy * 0.006, minPolar, maxPolar);
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    resumeTimer = setTimeout(() => { autoSpin = true; }, 1800);
  }
  function wheelZoom(e) {
    e.preventDefault();
    targetRadius = THREE.MathUtils.clamp(targetRadius + e.deltaY * 0.003, minRadius, maxRadius);
  }

  canvas.addEventListener("mousedown", pointerDown);
  window.addEventListener("mousemove", pointerMove);
  window.addEventListener("mouseup", pointerUp);
  canvas.addEventListener("touchstart", pointerDown, { passive: true });
  window.addEventListener("touchmove", pointerMove, { passive: true });
  window.addEventListener("touchend", pointerUp);
  canvas.addEventListener("wheel", wheelZoom, { passive: false });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);

    if (autoSpin) targetAzimuth += dt * 0.22;
    azimuth += (targetAzimuth - azimuth) * 0.08;
    polar += (targetPolar - polar) * 0.08;
    radius += (targetRadius - radius) * 0.08;

    const sinPolar = Math.sin(polar);
    camera.position.x = camTarget.x + radius * sinPolar * Math.sin(azimuth);
    camera.position.y = camTarget.y + radius * Math.cos(polar);
    camera.position.z = camTarget.z + radius * sinPolar * Math.cos(azimuth);
    camera.lookAt(camTarget);

    renderer.render(scene, camera);
  }
  animate();
})();