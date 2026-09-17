/**
 * 3D Rock Scene — rockcoveragecalculator.com
 * Three.js interactive rock pile visualization.
 */

export async function initRockScene(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Dynamic import Three.js
  let THREE, OrbitControls;
  try {
    THREE = await import('three');
    const controls = await import('three/addons/controls/OrbitControls.js');
    OrbitControls = controls.OrbitControls;
  } catch (e) {
    console.warn('Three.js not available, showing fallback');
    container.innerHTML = `
      <div class="rock-scene-fallback">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
          <path d="M12 2L4 7.5V16.5L12 22L20 16.5V7.5L12 2Z"/>
          <path d="M12 2L12 10"/><path d="M12 10L20 7.5"/><path d="M12 10L4 7.5"/>
        </svg>
      </div>`;
    return null;
  }

  const width = container.clientWidth;
  const height = container.clientHeight || 300;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f1419);
  scene.fog = new THREE.Fog(0x0f1419, 15, 35);

  // Camera
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(8, 6, 8);
  camera.lookAt(0, 0, 0);

  // Renderer
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
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 4;
  controls.maxDistance = 20;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 30;
  dirLight.shadow.camera.left = -8;
  dirLight.shadow.camera.right = 8;
  dirLight.shadow.camera.top = 8;
  dirLight.shadow.camera.bottom = -8;
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0x6a8faa, 0.3);
  rimLight.position.set(-5, 3, -5);
  scene.add(rimLight);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510,
    roughness: 0.95,
    metalness: 0.0
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const gridHelper = new THREE.GridHelper(20, 20, 0x252e3c, 0x1a2029);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Rock pile group
  const rockGroup = new THREE.Group();
  scene.add(rockGroup);

  // Rock generation function
  function generateRocks(depth = 3, materialColor = 0x8b9da8, rockSize = 1) {
    // Clear existing rocks
    while (rockGroup.children.length) {
      const child = rockGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      rockGroup.remove(child);
    }

    const pileRadius = 3;
    const pileHeight = Math.max(depth / 4, 0.3);
    const rockCount = Math.min(Math.floor(depth * 15), 120);
    const sizeBase = 0.15 + rockSize * 0.1;

    for (let i = 0; i < rockCount; i++) {
      // Random position within a cone/dome shape
      const angle = Math.random() * Math.PI * 2;
      const radiusFrac = Math.pow(Math.random(), 0.5); // bias towards center
      const r = radiusFrac * pileRadius;
      const heightFrac = 1 - radiusFrac;
      const y = Math.random() * pileHeight * heightFrac;

      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // Rock geometry - deformed icosahedrons
      const detail = Math.random() > 0.7 ? 1 : 0;
      const geo = new THREE.IcosahedronGeometry(sizeBase + Math.random() * sizeBase, detail);

      // Deform vertices for natural rock look
      const posAttr = geo.attributes.position;
      for (let j = 0; j < posAttr.count; j++) {
        const vx = posAttr.getX(j);
        const vy = posAttr.getY(j);
        const vz = posAttr.getZ(j);
        const noise = 0.7 + Math.random() * 0.6;
        posAttr.setXYZ(j, vx * noise, vy * noise * 0.8, vz * noise);
      }
      geo.computeVertexNormals();

      // Color variation
      const color = new THREE.Color(materialColor);
      const hsl = {};
      color.getHSL(hsl);
      hsl.l = Math.max(0.1, Math.min(0.8, hsl.l + (Math.random() - 0.5) * 0.15));
      hsl.s = Math.max(0, Math.min(1, hsl.s + (Math.random() - 0.5) * 0.1));
      color.setHSL(hsl.h, hsl.s, hsl.l);

      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.75 + Math.random() * 0.2,
        metalness: 0.02,
        flatShading: detail === 0
      });

      const rock = new THREE.Mesh(geo, mat);
      rock.position.set(x, y + sizeBase, z);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      rock.castShadow = true;
      rock.receiveShadow = true;

      rockGroup.add(rock);
    }
  }

  // Initial generation
  generateRocks(3, 0x8b9da8, 1);

  // Animation loop
  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight || 300;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Return control interface
  return {
    updateRocks(depth, colorHex, size) {
      const color = parseInt(colorHex.replace('#', ''), 16);
      generateRocks(depth, color, size);
    },
    stopAutoRotate() { controls.autoRotate = false; },
    startAutoRotate() { controls.autoRotate = true; },
    resetCamera() {
      camera.position.set(8, 6, 8);
      camera.lookAt(0, 0, 0);
      controls.reset();
    },
    dispose() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      container.removeChild(renderer.domElement);
    }
  };
}
