/**
 * 3D Rock Scene - rockcoveragecalculator.com
 * Three.js interactive rock bed & pile visualization.
 * Dynamically builds actual landscape beds (Rectangle, Circle, Ring, Triangle,
 * Trapezoid, L-Shape) with authentic perimeter edging, compacted earth subgrade,
 * and procedural stone aggregates tailored to the selected material.
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
  scene.fog = new THREE.Fog(0x0f1419, 14, 34);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(6.5, 5.5, 6.5);
  camera.lookAt(0, 0.4, 0);

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
  controls.maxDistance = 18;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0.3, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xd1dce8, 0.75);
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

  // Dedicated groups for dynamic elements
  const bedGroup = new THREE.Group();
  scene.add(bedGroup);

  const rockGroup = new THREE.Group();
  scene.add(rockGroup);

  // Materials for bed and edging
  const subgradeMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510,
    roughness: 0.95,
    metalness: 0.05
  });

  const edgingMat = new THREE.MeshStandardMaterial({
    color: 0x5a6a7d,
    roughness: 0.35,
    metalness: 0.75
  });

  const treeTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
    metalness: 0.0
  });

  // Base rock geometries for procedural instancing
  const rockGeos = [
    new THREE.DodecahedronGeometry(1, 1),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0)
  ];

  function clearGroup(group) {
    while (group.children.length) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      group.remove(child);
    }
  }

  /* ── Shape Boundary Sampling & Mesh Construction ── */

  function buildBedAndSamplePoints(shape = 'rectangle', dims = {}, depthInches = 3) {
    clearGroup(bedGroup);

    const points = [];
    const maxExtent = 5.6; // Max 3D footprint dimension
    const bedThickness = 0.28;
    const edgingHeight = 0.12;

    switch (shape) {
      case 'circle': {
        const rRaw = dims.radius || 5;
        const normR = 2.7;
        
        // Circular subgrade
        const geo = new THREE.CylinderGeometry(normR, normR * 1.02, bedThickness, 48);
        const mesh = new THREE.Mesh(geo, subgradeMat);
        mesh.position.y = -bedThickness / 2;
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // Circular edging
        const edgingGeo = new THREE.TorusGeometry(normR, 0.07, 10, 48);
        const edgingMesh = new THREE.Mesh(edgingGeo, edgingMat);
        edgingMesh.rotation.x = Math.PI / 2;
        edgingMesh.position.y = edgingHeight / 2;
        bedGroup.add(edgingMesh);

        // Sample points
        const count = Math.min(150, Math.max(60, Math.floor(depthInches * 18)));
        for (let i = 0; i < count; i++) {
          const r = Math.sqrt(Math.random()) * (normR - 0.22);
          const theta = Math.random() * Math.PI * 2;
          points.push({
            x: Math.cos(theta) * r,
            z: Math.sin(theta) * r,
            rRatio: r / normR
          });
        }
        break;
      }

      case 'ring': {
        const rOutRaw = dims.outerRadius || 8;
        const rInRaw = dims.innerRadius || 4;
        const ratio = Math.max(0.25, Math.min(0.75, rInRaw / rOutRaw));
        const normROut = 2.8;
        const normRIn = normROut * ratio;

        // Ring geometry
        const ringShape = new THREE.Shape();
        ringShape.absarc(0, 0, normROut, 0, Math.PI * 2, false);
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, normRIn, 0, Math.PI * 2, true);
        ringShape.holes.push(holePath);

        const extrudeSettings = { depth: bedThickness, bevelEnabled: false };
        const geo = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -bedThickness, 0);
        const mesh = new THREE.Mesh(geo, subgradeMat);
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // Outer and Inner Edging
        const outerEdgingGeo = new THREE.TorusGeometry(normROut, 0.07, 10, 48);
        const outerEdging = new THREE.Mesh(outerEdgingGeo, edgingMat);
        outerEdging.rotation.x = Math.PI / 2;
        outerEdging.position.y = edgingHeight / 2;
        bedGroup.add(outerEdging);

        const innerEdgingGeo = new THREE.TorusGeometry(normRIn, 0.06, 10, 48);
        const innerEdging = new THREE.Mesh(innerEdgingGeo, edgingMat);
        innerEdging.rotation.x = Math.PI / 2;
        innerEdging.position.y = edgingHeight / 2;
        bedGroup.add(innerEdging);

        // Center feature: stylized landscape tree trunk
        const trunkGeo = new THREE.CylinderGeometry(normRIn * 0.45, normRIn * 0.55, 1.6, 24);
        const trunkMesh = new THREE.Mesh(trunkGeo, treeTrunkMat);
        trunkMesh.position.y = 0.8 - bedThickness;
        trunkMesh.castShadow = true;
        trunkMesh.receiveShadow = true;
        bedGroup.add(trunkMesh);

        // Sample points in ring band
        const count = Math.min(150, Math.max(60, Math.floor(depthInches * 18)));
        for (let i = 0; i < count; i++) {
          const r = Math.sqrt(Math.random() * (normROut * normROut - normRIn * normRIn) + normRIn * normRIn);
          const theta = Math.random() * Math.PI * 2;
          // Stay within safe margin
          if (r > normRIn + 0.15 && r < normROut - 0.15) {
            points.push({
              x: Math.cos(theta) * r,
              z: Math.sin(theta) * r,
              rRatio: (r - normRIn) / (normROut - normRIn)
            });
          }
        }
        break;
      }

      case 'triangle': {
        const bRaw = dims.base || 10;
        const hRaw = dims.height || 8;
        const scale = maxExtent / Math.max(bRaw, hRaw);
        const b = bRaw * scale;
        const h = hRaw * scale;

        const triShape = new THREE.Shape();
        triShape.moveTo(-b / 2, -h / 2);
        triShape.lineTo(b / 2, -h / 2);
        triShape.lineTo(0, h / 2);
        triShape.closePath();

        const geo = new THREE.ExtrudeGeometry(triShape, { depth: bedThickness, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -bedThickness, 0);
        const mesh = new THREE.Mesh(geo, subgradeMat);
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // Edging beams along 3 triangle sides
        const pA = new THREE.Vector3(-b / 2, edgingHeight / 2, -h / 2);
        const pB = new THREE.Vector3(b / 2, edgingHeight / 2, -h / 2);
        const pC = new THREE.Vector3(0, edgingHeight / 2, h / 2);

        function addBeam(v1, v2) {
          const dist = v1.distanceTo(v2);
          const beamGeo = new THREE.BoxGeometry(0.1, 0.14, dist);
          const beam = new THREE.Mesh(beamGeo, edgingMat);
          const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
          beam.position.copy(mid);
          beam.lookAt(v2);
          bedGroup.add(beam);
        }
        addBeam(pA, pB);
        addBeam(pB, pC);
        addBeam(pC, pA);

        // Sample points inside triangle via barycentric coordinates
        const count = Math.min(140, Math.max(50, Math.floor(depthInches * 16)));
        for (let i = 0; i < count; i++) {
          let u = Math.random();
          let v = Math.random();
          if (u + v > 1) {
            u = 1 - u;
            v = 1 - v;
          }
          const w = 1 - u - v;
          // In X-Z plane
          const x = w * (-b / 2) + u * (b / 2) + v * 0;
          const z = w * (-h / 2) + u * (-h / 2) + v * (h / 2);
          points.push({ x, z, rRatio: 0.5 });
        }
        break;
      }

      case 'trapezoid': {
        const topRaw = dims.top || 6;
        const btmRaw = dims.bottom || 12;
        const hRaw = dims.height || 8;
        const maxDim = Math.max(topRaw, btmRaw, hRaw);
        const scale = maxExtent / maxDim;

        const top = topRaw * scale;
        const btm = btmRaw * scale;
        const h = hRaw * scale;

        const trapShape = new THREE.Shape();
        trapShape.moveTo(-btm / 2, -h / 2);
        trapShape.lineTo(btm / 2, -h / 2);
        trapShape.lineTo(top / 2, h / 2);
        trapShape.lineTo(-top / 2, h / 2);
        trapShape.closePath();

        const geo = new THREE.ExtrudeGeometry(trapShape, { depth: bedThickness, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -bedThickness, 0);
        const mesh = new THREE.Mesh(geo, subgradeMat);
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // 4 border beams
        const p1 = new THREE.Vector3(-btm / 2, edgingHeight / 2, -h / 2);
        const p2 = new THREE.Vector3(btm / 2, edgingHeight / 2, -h / 2);
        const p3 = new THREE.Vector3(top / 2, edgingHeight / 2, h / 2);
        const p4 = new THREE.Vector3(-top / 2, edgingHeight / 2, h / 2);

        function addBeam(v1, v2) {
          const dist = v1.distanceTo(v2);
          const beamGeo = new THREE.BoxGeometry(0.1, 0.14, dist);
          const beam = new THREE.Mesh(beamGeo, edgingMat);
          const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
          beam.position.copy(mid);
          beam.lookAt(v2);
          bedGroup.add(beam);
        }
        addBeam(p1, p2);
        addBeam(p2, p3);
        addBeam(p3, p4);
        addBeam(p4, p1);

        // Sample points inside trapezoid
        const count = Math.min(140, Math.max(50, Math.floor(depthInches * 16)));
        for (let i = 0; i < count; i++) {
          const t = Math.random(); // 0 at bottom, 1 at top
          const z = -h / 2 + t * h;
          const currentWidth = btm + t * (top - btm);
          const x = (Math.random() - 0.5) * (currentWidth - 0.3);
          points.push({ x, z, rRatio: 0.5 });
        }
        break;
      }

      case 'lshape': {
        const l1Raw = dims.length1 || 12;
        const w1Raw = dims.width1 || 4;
        const l2Raw = dims.length2 || 6;
        const w2Raw = dims.width2 || 4;

        const maxDim = Math.max(l1Raw, l2Raw + w1Raw, w1Raw, w2Raw);
        const scale = maxExtent / maxDim;

        const l1 = l1Raw * scale;
        const w1 = w1Raw * scale;
        const l2 = l2Raw * scale;
        const w2 = w2Raw * scale;

        // Center origin
        const offsetX = -(w1 + l2) / 2;
        const offsetZ = -l1 / 2;

        const lShape = new THREE.Shape();
        lShape.moveTo(offsetX, offsetZ);
        lShape.lineTo(offsetX + w1, offsetZ);
        lShape.lineTo(offsetX + w1, offsetZ + l1 - w2);
        lShape.lineTo(offsetX + w1 + l2, offsetZ + l1 - w2);
        lShape.lineTo(offsetX + w1 + l2, offsetZ + l1);
        lShape.lineTo(offsetX, offsetZ + l1);
        lShape.closePath();

        const geo = new THREE.ExtrudeGeometry(lShape, { depth: bedThickness, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2);
        geo.translate(0, -bedThickness, 0);
        const mesh = new THREE.Mesh(geo, subgradeMat);
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // Edging along perimeter
        const polyPoints = [
          new THREE.Vector3(offsetX, edgingHeight / 2, offsetZ),
          new THREE.Vector3(offsetX + w1, edgingHeight / 2, offsetZ),
          new THREE.Vector3(offsetX + w1, edgingHeight / 2, offsetZ + l1 - w2),
          new THREE.Vector3(offsetX + w1 + l2, edgingHeight / 2, offsetZ + l1 - w2),
          new THREE.Vector3(offsetX + w1 + l2, edgingHeight / 2, offsetZ + l1),
          new THREE.Vector3(offsetX, edgingHeight / 2, offsetZ + l1)
        ];

        for (let i = 0; i < polyPoints.length; i++) {
          const next = polyPoints[(i + 1) % polyPoints.length];
          const dist = polyPoints[i].distanceTo(next);
          const beamGeo = new THREE.BoxGeometry(0.09, 0.14, dist);
          const beam = new THREE.Mesh(beamGeo, edgingMat);
          const mid = new THREE.Vector3().addVectors(polyPoints[i], next).multiplyScalar(0.5);
          beam.position.copy(mid);
          beam.lookAt(next);
          bedGroup.add(beam);
        }

        // Sample points across the two rectangular arms
        const area1 = l1 * w1;
        const area2 = l2 * w2;
        const totalA = area1 + area2;
        const count = Math.min(150, Math.max(60, Math.floor(depthInches * 18)));

        for (let i = 0; i < count; i++) {
          if (Math.random() < area1 / totalA) {
            // Main Arm 1
            const x = offsetX + 0.15 + Math.random() * (w1 - 0.3);
            const z = offsetZ + 0.15 + Math.random() * (l1 - 0.3);
            points.push({ x, z, rRatio: 0.5 });
          } else {
            // Extension Arm 2
            const x = offsetX + w1 + 0.15 + Math.random() * (l2 - 0.3);
            const z = offsetZ + (l1 - w2) + 0.15 + Math.random() * (w2 - 0.3);
            points.push({ x, z, rRatio: 0.5 });
          }
        }
        break;
      }

      case 'rectangle':
      default: {
        const lRaw = dims.length || 10;
        const wRaw = dims.width || 10;
        const maxDim = Math.max(lRaw, wRaw);
        const scale = maxExtent / maxDim;

        const w = Math.max(1.2, wRaw * scale);
        const l = Math.max(1.2, lRaw * scale);

        // Rectangular subgrade box
        const boxGeo = new THREE.BoxGeometry(w, bedThickness, l);
        const mesh = new THREE.Mesh(boxGeo, subgradeMat);
        mesh.position.y = -bedThickness / 2;
        mesh.receiveShadow = true;
        bedGroup.add(mesh);

        // 4 Steel Edging Borders
        const halfW = w / 2;
        const halfL = l / 2;

        const beamLongGeo = new THREE.BoxGeometry(w + 0.16, 0.14, 0.08);
        const beamShortGeo = new THREE.BoxGeometry(0.08, 0.14, l);

        const edgeFront = new THREE.Mesh(beamLongGeo, edgingMat);
        edgeFront.position.set(0, edgingHeight / 2, halfL);
        bedGroup.add(edgeFront);

        const edgeBack = new THREE.Mesh(beamLongGeo, edgingMat);
        edgeBack.position.set(0, edgingHeight / 2, -halfL);
        bedGroup.add(edgeBack);

        const edgeLeft = new THREE.Mesh(beamShortGeo, edgingMat);
        edgeLeft.position.set(-halfW, edgingHeight / 2, 0);
        bedGroup.add(edgeLeft);

        const edgeRight = new THREE.Mesh(beamShortGeo, edgingMat);
        edgeRight.position.set(halfW, edgingHeight / 2, 0);
        bedGroup.add(edgeRight);

        // Sample points inside rectangle
        const count = Math.min(150, Math.max(60, Math.floor(depthInches * 18)));
        for (let i = 0; i < count; i++) {
          const x = (Math.random() - 0.5) * (w - 0.3);
          const z = (Math.random() - 0.5) * (l - 0.3);
          points.push({ x, z, rRatio: Math.sqrt(x * x + z * z) / maxExtent });
        }
        break;
      }
    }

    return points;
  }

  /* ── Procedural Stone Generation Tailored to Material ── */

  function generateRocksForPoints(points, depthInches = 3, material = {}) {
    clearGroup(rockGroup);

    const swatch = material.swatchColor || '#a09080';
    const hex = typeof swatch === 'string' ? parseInt(swatch.replace('#', ''), 16) : swatch;
    const baseColorObj = new THREE.Color(hex);

    // Sizing and texture factors by rock type
    let sizeScale = 0.15;
    let roughness = 0.85;
    let flatShading = true;
    let aspectY = 0.85;

    const id = material.id || '';
    if (id === 'pea-gravel') {
      sizeScale = 0.10;
      roughness = 0.7;
      flatShading = false;
      aspectY = 0.9;
    } else if (id.includes('river-rock')) {
      sizeScale = id.includes('3-5') ? 0.28 : 0.18;
      roughness = 0.65;
      flatShading = false;
      aspectY = 0.6; // Water-tumbled flat oval profile
    } else if (id === 'lava-rock') {
      sizeScale = 0.19;
      roughness = 0.98;
      flatShading = true;
      aspectY = 1.0;
    } else if (id === 'marble-chips') {
      sizeScale = 0.14;
      roughness = 0.5;
      flatShading = true;
      aspectY = 0.8;
    } else if (id === 'rip-rap') {
      sizeScale = 0.32;
      roughness = 0.9;
      flatShading = true;
      aspectY = 0.85;
    } else if (id === 'egg-rock') {
      sizeScale = 0.22;
      roughness = 0.6;
      flatShading = false;
      aspectY = 0.65;
    }

    // Depth tiering: deeper beds have multi-tier stacking
    const depthTier = Math.max(0.1, depthInches / 6);

    points.forEach((pt, idx) => {
      const geoIndex = idx % rockGeos.length;
      const geo = rockGeos[geoIndex].clone();

      // Deform vertices for natural fractured stone facet
      const pos = geo.attributes.position;
      const noiseAmp = id === 'lava-rock' ? 0.38 : (id.includes('river') ? 0.15 : 0.25);
      for (let j = 0; j < pos.count; j++) {
        const vx = pos.getX(j);
        const vy = pos.getY(j);
        const vz = pos.getZ(j);
        const factor = 1 - noiseAmp + Math.random() * noiseAmp * 2;
        pos.setXYZ(j, vx * factor, vy * factor * aspectY, vz * factor);
      }
      geo.computeVertexNormals();

      // Individual stone color tint variation
      const color = baseColorObj.clone();
      const hsl = {};
      color.getHSL(hsl);
      hsl.l = Math.max(0.12, Math.min(0.9, hsl.l + (Math.random() - 0.5) * 0.2));
      hsl.s = Math.max(0.04, Math.min(0.95, hsl.s + (Math.random() - 0.5) * 0.15));
      color.setHSL(hsl.h, hsl.s, hsl.l);

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: 0.05,
        flatShading: flatShading
      });

      const rock = new THREE.Mesh(geo, mat);
      const scale = sizeScale * (0.8 + Math.random() * 0.45);
      rock.scale.set(scale, scale * aspectY, scale);

      // Stacking layer: depth elevates stones
      const layerOffset = Math.random() * depthTier * 0.3;
      rock.position.set(pt.x, scale * 0.6 + layerOffset, pt.z);
      rock.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      rock.castShadow = true;
      rock.receiveShadow = true;
      rockGroup.add(rock);
    });
  }

  // Initial Scene Setup
  const initialPoints = buildBedAndSamplePoints('rectangle', { length: 10, width: 10 }, 3);
  generateRocksForPoints(initialPoints, 3, { swatchColor: '#a09080', id: 'pea-gravel' });

  // On-canvas HUD control overlays
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
      camera.position.set(6.5, 5.5, 6.5);
      camera.lookAt(0, 0.4, 0);
      controls.target.set(0, 0.3, 0);
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
    updateScene(config = {}) {
      const shape = config.shape || 'rectangle';
      const dims = config.dims || { length: 10, width: 10 };
      const depth = config.depth || 3;
      const material = config.material || { swatchColor: '#a09080', id: 'pea-gravel' };

      const samplePts = buildBedAndSamplePoints(shape, dims, depth);
      generateRocksForPoints(samplePts, depth, material);
    },

    updateRocks(depthOrConfig, colorHex, sizeFactor) {
      if (typeof depthOrConfig === 'object') {
        this.updateScene(depthOrConfig);
      } else {
        const depth = depthOrConfig || 3;
        const swatch = typeof colorHex === 'string' ? colorHex : (colorHex ? `#${colorHex.toString(16)}` : '#a09080');
        this.updateScene({ depth, material: { swatchColor: swatch } });
      }
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
