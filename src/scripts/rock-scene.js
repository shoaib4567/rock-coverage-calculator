/**
 * 3D Rock Scene - rockcoveragecalculator.com
 * Three.js interactive rock pile visualization with realistic lighting,
 * procedural stone geometries, and interactive camera controls.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export async function initRockScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 280;

  // Clear any existing fallback or loading markup
  container.innerHTML = '';

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1419);
  scene.fog = new THREE.Fog(0x0f1419, 14, 32);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(7, 5, 7);
  camera.lookAt(0, 0.5, 0);

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 3.5;
  controls.maxDistance = 16;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0.5, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xd1dce8, 0.7);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
  mainLight.position.set(6, 10, 6);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.camera.near = 0.5;
  mainLight.shadow.camera.far = 25;
  mainLight.shadow.bias = -0.001;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x6a8faa, 0.5);
  fillLight.position.set(-6, 4, -4);
  scene.add(fillLight);

  // Subgrade Ground Bed
  const groundGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.3, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1f1a14,
    roughness: 0.95,
    metalness: 0.05
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.15;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Edging Ring
  const ringGeo = new THREE.TorusGeometry(3.65, 0.06, 8, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x6b7a8d,
    roughness: 0.4,
    metalness: 0.8
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2;
  ringMesh.position.y = 0;
  scene.add(ringMesh);

  // Rock Group
  const rockGroup = new THREE.Group();
  scene.add(rockGroup);

  // Reusable rock geometries
  const baseGeometries = [
    new THREE.DodecahedronGeometry(1, 1),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0)
  ];

  function generateRocks(depth = 3, materialColor = 0x8b9da8, rockScale = 1) {
    // Clear previous rocks
    while (rockGroup.children.length) {
      const child = rockGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      rockGroup.remove(child);
    }

    const count = Math.min(Math.floor(depth * 18), 160);
    const radiusMax = 3.2;
    const baseSize = 0.14 * rockScale;
    const pileHeight = Math.max(depth / 5, 0.35);

    const baseColorObj = new THREE.Color(materialColor);

    for (let i = 0; i < count; i++) {
      const rRatio = Math.sqrt(Math.random());
      const r = rRatio * radiusMax;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = Math.max(0, (1 - rRatio) * pileHeight * (0.6 + Math.random() * 0.4));

      const geoIndex = i % baseGeometries.length;
      const geo = baseGeometries[geoIndex].clone();

      // Deform vertices for natural stone facet
      const pos = geo.attributes.position;
      const noiseAmp = 0.25;
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j);
        const vy = pos.getY(j);
        const vz = pos.getZ(j);
        const factor = 1 - noiseAmp + Math.random() * noiseAmp * 2;
        pos.setXYZ(j, vx * factor, vy * (factor * 0.85), vz * factor);
      }
      geo.computeVertexNormals();

      // Color tint variation
      const color = baseColorObj.clone();
      const hsl = {};
      color.getHSL(hsl);
      hsl.l = Math.max(0.15, Math.min(0.85, hsl.l + (Math.random() - 0.5) * 0.18));
      hsl.s = Math.max(0.05, Math.min(0.95, hsl.s + (Math.random() - 0.5) * 0.12));
      color.setHSL(hsl.h, hsl.s, hsl.l);

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.82 + Math.random() * 0.15,
        metalness: 0.05,
        flatShading: true
      });

      const rock = new THREE.Mesh(geo, mat);
      const scaleVariation = baseSize * (0.8 + Math.random() * 0.5);
      rock.scale.set(scaleVariation, scaleVariation * (0.7 + Math.random() * 0.4), scaleVariation);
      rock.position.set(x, y + baseSize, z);
      rock.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      rockGroup.add(rock);
    }
  }

  // Initial rock pile build
  generateRocks(3, 0xa09080, 0.7);

  // Add on-canvas HUD control overlays
  const hud = document.createElement('div');
  hud.className = 'scene-controls';
  hud.innerHTML = `
    <button type="button" id="btn-rotate-toggle" title="Toggle Auto-Rotation" aria-label="Toggle auto rotation">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
    </button>
    <button type="button" id="btn-reset-cam" title="Reset Viewpoint" aria-label="Reset 3D viewpoint">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>
  `;
  container.appendChild(hud);

  // Wire HUD events
  const rotBtn = hud.querySelector('#btn-rotate-toggle');
  if (rotBtn) {
    rotBtn.addEventListener('click', () => {
      controls.autoRotate = !controls.autoRotate;
      rotBtn.classList.toggle('active', controls.autoRotate);
    });
  }

  const resetBtn = hud.querySelector('#btn-reset-cam');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      camera.position.set(7, 5, 7);
      camera.lookAt(0, 0.5, 0);
      controls.reset();
    });
  }

  // Animation Loop
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize Observer
  const resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height || 280;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }
  });
  resizeObserver.observe(container);

  return {
    updateRocks(depth, colorHex, sizeFactor = 1) {
      const hex = typeof colorHex === 'string' ? parseInt(colorHex.replace('#', ''), 16) : colorHex;
      generateRocks(depth, hex, sizeFactor);
    },
    dispose() {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
