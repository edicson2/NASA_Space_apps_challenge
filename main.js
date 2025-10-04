// main.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// Exported init function — mounts the three.js scene into a provided container (or document.body)
export function initCupola(container) {
  const mountTarget = container || document.body;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  mountTarget.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(2, 3, 8);

  // ----- PointerLockControls -----
  const fpControls = new PointerLockControls(camera, renderer.domElement);
  const move = { forward: false, backward: false, left: false, right: false };
  const velocity = new THREE.Vector3();
  const speed = 20;
  const damping = 6.0;

  const onDocClickToLock = () => fpControls.lock();
  mountTarget.addEventListener("click", onDocClickToLock);

  fpControls.addEventListener("lock", () => console.log("Pointer locked"));
  fpControls.addEventListener("unlock", () => console.log("Pointer unlocked"));

  const onKeyDown = (e) => {
    switch (e.code) {
      case "KeyW":
        move.forward = true;
        break;
      case "KeyS":
        move.backward = true;
        break;
      case "KeyA":
        move.left = true;
        break;
      case "KeyD":
        move.right = true;
        break;
    }
  };

  const onKeyUp = (e) => {
    switch (e.code) {
      case "KeyW":
        move.forward = false;
        break;
      case "KeyS":
        move.backward = false;
        break;
      case "KeyA":
        move.left = false;
        break;
      case "KeyD":
        move.right = false;
        break;
    }
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // ----- OrbitControls (optional) -----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = true;
  controls.minDistance = 0.5;
  controls.maxDistance = 50;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.autoRotate = false;
  controls.target = new THREE.Vector3(0, 1, 0);
  controls.update();

  // ----- Ground (optional) -----
  const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
  groundGeometry.rotateX(-Math.PI / 2);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    side: THREE.DoubleSide,
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.castShadow = false;
  groundMesh.receiveShadow = true;
  // scene.add(groundMesh);

  // ----- Light -----
  const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
  spotLight.position.set(0, 25, 0);
  spotLight.castShadow = false;
  spotLight.shadow.bias = -0.0001;
  scene.add(spotLight);

  // ----- Cupola Model -----
  let cupolaMesh;
  const loaderCupola = new GLTFLoader().setPath("/cupola_2/");
  const clickableObjects = [];
  loaderCupola.load(
    "scene.glb",
    (gltf) => {
      cupolaMesh = gltf.scene;
      cupolaMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(cupolaMesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 5;
      const scale = targetSize / maxDim;
      cupolaMesh.scale.set(scale, scale, scale);

      cupolaMesh.position.x = -center.x * scale;
      cupolaMesh.position.y = -center.y * scale + 1.05;
      cupolaMesh.position.z = -center.z * scale;

      cupolaMesh.rotation.x = Math.PI;

      scene.add(cupolaMesh);

      cupolaMesh.traverse((child) => {
        if (child.isMesh) clickableObjects.push(child);
      });

      const progressEl = document.getElementById("progress-container");
      if (progressEl) progressEl.style.display = "none";
    },
    (xhr) => console.log(`Cupola loading ${(xhr.loaded / xhr.total) * 100}%`),
    (error) => console.error("Error loading Cupola:", error)
  );

  const clock = new THREE.Clock();

  // ----- Raycaster for Click Detection -----
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const onWindowClick = (event) => {
    if (fpControls.isLocked) return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      console.log("Clicked on:", clickedObject.name || "unnamed object");
      displayObjectInfo(clickedObject);
    }
  };

  renderer.domElement.addEventListener("click", onWindowClick);

  function displayObjectInfo(object) {
    let infoPanel = document.getElementById("info-panel");
    if (!infoPanel) {
      infoPanel = document.createElement("div");
      infoPanel.id = "info-panel";
      infoPanel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 30px;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: white;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid rgba(100, 150, 255, 0.5);
        max-width: 300px;
        z-index: 150;
        font-family: Arial, sans-serif;
      `;
      document.body.appendChild(infoPanel);
    }

    infoPanel.innerHTML = `
      <h3 style="margin-top: 0; color: #66bbff;">Object Details</h3>
      <p><strong>Name:</strong> ${object.name || "Unnamed"}</p>
      <p><strong>Type:</strong> ${object.type}</p>
      <p><strong>Position:</strong> (${object.position.x.toFixed(
        2
      )}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})</p>
      <button id="info-panel-close" style="
        margin-top: 10px;
        background: #0066cc;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
      ">Close</button>
    `;

    const closeBtn = document.getElementById("info-panel-close");
    if (closeBtn) closeBtn.addEventListener("click", () => infoPanel.remove());
  }

  let running = true;
  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (fpControls.isLocked) {
      const direction = new THREE.Vector3();
      direction.z = Number(move.backward) - Number(move.forward);
      direction.x = Number(move.right) - Number(move.left);
      direction.normalize();

      velocity.x -= velocity.x * damping * delta;
      velocity.z -= velocity.z * damping * delta;

      velocity.x += direction.x * speed * delta;
      velocity.z += direction.z * speed * delta;

      fpControls.moveRight(velocity.x * delta);
      fpControls.moveForward(velocity.z * delta);
    } else {
      controls.update();
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    const w =
      mountTarget === document.body
        ? window.innerWidth
        : mountTarget.clientWidth;
    const h =
      mountTarget === document.body
        ? window.innerHeight
        : mountTarget.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener("resize", onResize);

  // start
  animate();

  // return dispose helper
  return {
    dispose() {
      running = false;
      // remove listeners
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      mountTarget.removeEventListener("click", onDocClickToLock);
      renderer.domElement.removeEventListener("click", onWindowClick);
      window.removeEventListener("resize", onResize);

      // dispose renderer and scene
      try {
        renderer.forceContextLoss();
        renderer.domElement && renderer.domElement.remove();
      } catch (e) {
        // ignore
      }
    },
  };
}

// If file is included directly as a script, auto-init into body
if (typeof window !== "undefined" && typeof document !== "undefined") {
  // run on next tick so other scripts can set up
  setTimeout(() => {
    if (!window.__cupola_auto_initialized__) {
      window.__cupola_auto_initialized__ = true;
      initCupola(document.body);
    }
  }, 0);
}
