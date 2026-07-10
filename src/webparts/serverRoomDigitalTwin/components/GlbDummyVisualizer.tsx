import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import styles from './ServerRoomDigitalTwin.module.scss';

const assetBasePath = 'assets/glb/';
const rackFrameAsset = 'rack-frame.glb';
const blockNormalAsset = 'block-normal.glb';
const blockSmallAsset = 'block-small.glb';

const deviceTypeColors: { [key: string]: number } = {
  Switch: 0x39a8ff,
  Server: 0x38d58a,
  Firewall: 0xff8a32,
  Storage: 0x9c6dff,
  UPS: 0x8f4a31,
  Patch: 0xaab4c2
};

const glbCache: { [key: string]: Promise<THREE.Object3D | undefined> } = {};

const cloneObject = (object: THREE.Object3D): THREE.Object3D => object.clone(true);

const loadGlb = (loader: GLTFLoader, fileName: string): Promise<THREE.Object3D | undefined> => {
  const url = `${assetBasePath}${fileName}`;
  if (!glbCache[url]) {
    glbCache[url] = new Promise((resolve) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, () => resolve(undefined));
    });
  }
  return glbCache[url];
};

const createFallbackBox = (kind: 'rack' | 'normal' | 'small', color: number): THREE.Object3D => {
  const size = kind === 'rack' ? [1.1, 3.15, 0.9] : kind === 'normal' ? [0.9, 0.22, 0.2] : [0.42, 0.18, 0.2];
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: 0.16 }));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0], size[1], size[2])), new THREE.LineBasicMaterial({ color: 0xc9e7ff, transparent: true, opacity: 0.32 }));
  const group = new THREE.Group();
  group.add(mesh, edges);
  return group;
};

const recolorObject = (object: THREE.Object3D, color: number): void => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.18, emissive: color, emissiveIntensity: 0.04 });
  });
};

const makeLabel = (text: string): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(7, 14, 25, 0.74)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(142, 203, 255, 0.45)';
    context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
    context.fillStyle = '#f4f8ff';
    context.font = '700 34px Segoe UI, Arial, sans-serif';
    context.fillText(text, 26, 78);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(1.55, 0.38, 1);
  return sprite;
};

const GlbDummyVisualizer: React.FC = () => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [loadState, setLoadState] = React.useState<string>('Lade GLB-Dummy-Assets...');

  React.useEffect(() => {
    if (!hostRef.current) return undefined;
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08111f);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(4.8, 3.4, 5.6);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 900, host.clientHeight || 520);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x111827, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
    keyLight.position.set(5, 7, 4);
    scene.add(keyLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 6), new THREE.MeshStandardMaterial({ color: 0x0b1727, roughness: 0.82, metalness: 0.05 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.72;
    scene.add(floor);
    const grid = new THREE.GridHelper(9, 14, 0x24445f, 0x14283b);
    grid.position.y = -1.7;
    scene.add(grid);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    const loader = new GLTFLoader();
    let mounted = true;

    const addRack = async (x: number, z: number, scale: number, label: string): Promise<void> => {
      const rackTemplate = await loadGlb(loader, rackFrameAsset);
      const rack = rackTemplate ? cloneObject(rackTemplate) : createFallbackBox('rack', 0x18324a);
      rack.position.set(x, -0.05, z);
      rack.rotation.y = -0.38;
      rack.scale.setScalar(scale);
      roomGroup.add(rack);
      const rackLabel = makeLabel(label);
      rackLabel.position.set(x, 1.9 * scale, z - 0.55);
      roomGroup.add(rackLabel);
    };

    const addDevice = async (fileName: string, type: string, name: string, x: number, y: number, z: number, small: boolean): Promise<void> => {
      const template = await loadGlb(loader, fileName);
      const device = template ? cloneObject(template) : createFallbackBox(small ? 'small' : 'normal', deviceTypeColors[type]);
      recolorObject(device, deviceTypeColors[type]);
      device.position.set(x, y, z);
      device.rotation.y = -0.38;
      device.scale.setScalar(1.05);
      roomGroup.add(device);
      const label = makeLabel(name);
      label.position.set(x, y + 0.2, z - 0.45);
      label.scale.set(1.1, 0.27, 1);
      roomGroup.add(label);
    };

    Promise.all([
      addRack(-1.6, 0, 1, 'Rack A01'),
      addRack(0, -0.25, 0.86, 'Rack A02'),
      addRack(1.45, 0.15, 0.72, 'Rack B01'),
      addDevice(blockNormalAsset, 'Server', 'APP-DEMO-01', -1.61, 0.48, -0.55, false),
      addDevice(blockSmallAsset, 'Switch', 'SW-DEMO-01', -1.86, 1.06, -0.55, true),
      addDevice(blockSmallAsset, 'Firewall', 'FW-DEMO-01', -1.36, 1.06, -0.55, true)
    ]).then(() => {
      if (mounted) setLoadState('GLB Visualizer bereit. Fehlende GLBs werden automatisch prozedural ersetzt.');
    });

    const onResize = (): void => {
      const width = host.clientWidth || 900;
      const height = host.clientHeight || 520;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    let frameId = 0;
    const animate = (): void => {
      roomGroup.rotation.y += 0.0022;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <section className={styles.glbVisualizer}><div ref={hostRef} className={styles.glbCanvas} /><div className={styles.glbOverlay}><span>GLB Dummy Visualizer</span><strong>rack-frame.glb · block-normal.glb · block-small.glb</strong><p>{loadState}</p></div></section>;
};

export default GlbDummyVisualizer;
