// main.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

// ----- Instructions Panel -----
const instructionsPanel = document.createElement("div");
instructionsPanel.id = "instructions-panel";
instructionsPanel.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  padding: 20px 25px;
  border-radius: 12px;
  border: 1px solid rgba(100, 150, 255, 0.4);
  max-width: 320px;
  z-index: 100;
  font-family: 'Segoe UI', Arial, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;
instructionsPanel.innerHTML = `
  <h2 style="margin: 0 0 15px 0; color: #66bbff; font-size: 18px; font-weight: 600;">🎮 Controls</h2>
  
  <div style="margin-bottom: 12px;">
    <strong style="color: #88ccff;">Orbit Mode (Default):</strong>
    <ul style="margin: 5px 0; padding-left: 20px; line-height: 1.6;">
      <li><strong>Left Mouse:</strong> Rotate view</li>
      <li><strong>Right Mouse:</strong> Pan</li>
      <li><strong>Scroll:</strong> Zoom in/out</li>
      <li><strong>Click Object:</strong> View details</li>
    </ul>
  </div>
  
  <div style="margin-bottom: 12px;">
    <strong style="color: #88ccff;">First-Person Mode:</strong>
    <ul style="margin: 5px 0; padding-left: 20px; line-height: 1.6;">
      <li><strong>Press E:</strong> Enter FP mode</li>
      <li><strong>W/A/S/D:</strong> Move around</li>
      <li><strong>Mouse:</strong> Look around</li>
      <li><strong>ESC:</strong> Exit FP mode</li>
    </ul>
  </div>
  
  <button id="hide-instructions" style="
    width: 100%;
    background: #0066cc;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
    margin-top: 5px;
  ">Hide Instructions</button>
`;
document.body.appendChild(instructionsPanel);

// Hide/Show Instructions Toggle
document.getElementById("hide-instructions").addEventListener("click", () => {
  instructionsPanel.style.display = "none";
  showInstructionsBtn.style.display = "block";
});

const showInstructionsBtn = document.createElement("button");
showInstructionsBtn.id = "show-instructions";
showInstructionsBtn.textContent = "?";
showInstructionsBtn.style.cssText = `
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(0, 102, 204, 0.9);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  z-index: 100;
  display: none;
  transition: background 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;
showInstructionsBtn.addEventListener("click", () => {
  instructionsPanel.style.display = "block";
  showInstructionsBtn.style.display = "none";
});
showInstructionsBtn.addEventListener("mouseenter", () => {
  showInstructionsBtn.style.background = "rgba(0, 102, 204, 1)";
});
showInstructionsBtn.addEventListener("mouseleave", () => {
  showInstructionsBtn.style.background = "rgba(0, 102, 204, 0.9)";
});
document.body.appendChild(showInstructionsBtn);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.01, // Near clipping plane - allows getting very close
  1000
);
// Starting position closer to cupola
camera.position.set(2, 3, 8);

// ----- PointerLockControls -----
const fpControls = new PointerLockControls(camera, renderer.domElement);
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const speed = 20;
const damping = 6.0;

// Only lock pointer when pressing 'E' key, not on click
document.addEventListener("keydown", (e) => {
  if (e.code === "KeyE" && !fpControls.isLocked) {
    fpControls.lock();
  }
});

fpControls.addEventListener("lock", () =>
  console.log("Pointer locked - Press ESC to exit")
);
fpControls.addEventListener("unlock", () => console.log("Pointer unlocked"));

document.addEventListener("keydown", (e) => {
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
});

document.addEventListener("keyup", (e) => {
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
});

// ----- OrbitControls (optional) -----
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true; // Enable panning to move around easier
controls.minDistance = 0.5; // Allow getting very close/inside
controls.maxDistance = 50; // allow more zoom out
controls.minPolarAngle = 0; // Remove angle restriction
controls.maxPolarAngle = Math.PI; // Allow full rotation
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
const loaderCupola = new GLTFLoader().setPath("public/cupola_2/");
loaderCupola.load(
  "scene.glb",
  (gltf) => {
    cupolaMesh = gltf.scene;
    cupolaMesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Make materials transparent
        if (child.material) {
          // Check if this is a window/glass material (adjust names as needed)
          const materialName = child.material.name
            ? child.material.name.toLowerCase()
            : "";
          const meshName = child.name ? child.name.toLowerCase() : "";

          // If it's glass/window, make it very transparent
          if (
            materialName.includes("glass") ||
            materialName.includes("window") ||
            meshName.includes("glass") ||
            meshName.includes("window")
          ) {
            child.material.transparent = true;
            child.material.opacity = 0.2; // Very transparent for windows
            child.material.side = THREE.DoubleSide;
            child.material.depthWrite = false;
          } else {
            // For other parts, less transparent
            child.material.transparent = true;
            child.material.opacity = 0.85; // Slightly transparent for structure
            child.material.side = THREE.DoubleSide;
            child.material.depthWrite = false;
          }

          console.log("Material:", materialName, "Mesh:", meshName);
        }
      }
    });

    // Calculate bounding box to center and scale properly
    const box = new THREE.Box3().setFromObject(cupolaMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Get the largest dimension
    const maxDim = Math.max(size.x, size.y, size.z);

    // Scale to fit nicely in view (adjust 5 to make bigger/smaller)
    const targetSize = 5;
    const scale = targetSize / maxDim;
    cupolaMesh.scale.set(scale, scale, scale);

    // Rotate 180 degrees vertically (around X axis) BEFORE positioning
    cupolaMesh.rotation.x = Math.PI;

    // Recalculate bounding box after rotation
    const rotatedBox = new THREE.Box3().setFromObject(cupolaMesh);
    const rotatedCenter = rotatedBox.getCenter(new THREE.Vector3());

    // Center the model based on rotated position
    cupolaMesh.position.x = -rotatedCenter.x;
    cupolaMesh.position.y = -rotatedCenter.y + 1.05;
    cupolaMesh.position.z = -rotatedCenter.z;

    scene.add(cupolaMesh);

    // Add all meshes to clickable objects array
    cupolaMesh.traverse((child) => {
      if (child.isMesh) {
        clickableObjects.push(child);
      }
    });

    console.log("Cupola loaded! Size:", size, "Scale:", scale);
    console.log("Clickable objects:", clickableObjects.length);

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => console.log(`Cupola loading ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading Cupola:", error)
);

const clock = new THREE.Clock();

// ----- Raycaster for Click Detection -----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let clickableObjects = [];

// Click event handler
window.addEventListener("click", (event) => {
  // Only handle clicks when not in pointer lock mode
  if (fpControls.isLocked) return;

  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections
  const intersects = raycaster.intersectObjects(clickableObjects, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log("Clicked on:", clickedObject.name || "unnamed object");

    // Display information
    displayObjectInfo(clickedObject);

    // Optional: Call your API here
    // fetchDataFromAPI(clickedObject.name);
  }
});

// Function to display information about clicked object
function displayObjectInfo(object) {
  // Create or update info panel
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

  // Display object information
  infoPanel.innerHTML = `
    <h3 style="margin-top: 0; color: #66bbff;">Object Details</h3>
    <p><strong>Name:</strong> ${object.name || "Unnamed"}</p>
    <p><strong>Type:</strong> ${object.type}</p>
    <p><strong>Position:</strong> (${object.position.x.toFixed(
      2
    )}, ${object.position.y.toFixed(2)}, ${object.position.z.toFixed(2)})</p>
    <button onclick="document.getElementById('info-panel').remove()" style="
      margin-top: 10px;
      background: #0066cc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
    ">Close</button>
  `;
}

// ----- Animate -----
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // FPS movement
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
