import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { IDevice, IModelAsset, IRack, MountWidth } from '../models/ServerRoomModels';
import styles from './ServerRoomDigitalTwin.module.scss';

interface IServerRoom3DViewProps {
  racks: IRack[];
  devices: IDevice[];
  modelAssets: IModelAsset[];
  assetLibraryPath: string;
  currentSiteUrl?: string;
  enableGlbLoading: boolean;
  selectedRackKey?: string;
  selectedDeviceKey?: string;
  onRackSelected: (rackKey: string) => void;
  onDeviceSelected: (device: IDevice) => void;
  onSceneUnavailable: (message: string) => void;
}

const rackWidth = 1.2;
const rackDepth = 1.1;
const standardRackHeight = 4.2;
const standardRackUnits = 42;
const deviceDepth = 0.24;
const deviceGap = 0.008;

const deviceColors: { [key: string]: number } = {
  Backup: 0x8b3fd6,
  Firewall: 0xd71920,
  Switch: 0xf2c300,
  Server: 0x20b15a,
  UPS: 0x713b22,
  Storage: 0x1677c8,
  PatchPanel: 0x343b46
};

const slotCountByMountWidth: { [key in MountWidth]: number } = {
  Full: 1,
  Half: 2,
  Third: 3,
  Quarter: 4
};

const cloneObject = (source: THREE.Object3D): THREE.Object3D => source.clone(true);
const trimSlashes = (value: string): string => value.replace(/^\/+|\/+$/g, '');
const encodePath = (path: string): string => path.split('/').map((part) => encodeURIComponent(part)).join('/');
const unique = (values: string[]): string[] => values.filter((value, index) => value && values.indexOf(value) === index);

const assetCandidateNames = (asset: IModelAsset): string[] => {
  const key = asset.ModelAssetKey.toLowerCase();
  const defaultNames = [asset.FileName, `${key}.glb`];
  if (asset.DefaultForDeviceType === 'Rack' || key === 'rack') return unique([...defaultNames, 'Rack.glb', 'rack.glb', 'rack-frame.glb', 'rack-cabinet.glb']);
  if (key === 'switch' || key === 'patchpanel') return unique([...defaultNames, 'Panel-middle.glb', 'Panel-normal.glb', 'block-small.glb', 'block-normal.glb']);
  return unique([...defaultNames, 'Panel-normal.glb', 'Panel-middle.glb', 'block-normal.glb', 'block-small.glb']);
};

const buildAssetUrls = (assetLibraryPath: string, currentSiteUrl: string | undefined, asset: IModelAsset | undefined): string[] => {
  if (!asset) return [];
  const candidates = assetCandidateNames(asset);
  const base = trimSlashes(assetLibraryPath || 'assets/glb');

  if (!currentSiteUrl) {
    return unique(candidates.map((fileName) => `${base}/${encodePath(fileName)}`));
  }

  const site = currentSiteUrl.replace(/\/+$/g, '');
  const sharePointPaths = [asset.LibraryRelativePath || `${assetLibraryPath}/${asset.FileName}`, ...candidates.map((fileName) => `${assetLibraryPath}/${fileName}`)];
  return unique(sharePointPaths.map((relativePath) => `${site}/${encodePath(trimSlashes(relativePath))}`));
};

const widthForMount = (mountWidth: MountWidth): number => rackWidth / slotCountByMountWidth[mountWidth];
const rackHeightFor = (rack: IRack): number => standardRackHeight * Math.max(1, rack.RackHeightU) / standardRackUnits;
const rackUnitHeight = (): number => standardRackHeight / standardRackUnits;

const xForSlot = (mountWidth: MountWidth, horizontalSlot: number): number => {
  const slots = slotCountByMountWidth[mountWidth];
  const slot = Math.max(1, Math.min(horizontalSlot, slots));
  const segment = rackWidth / slots;
  return -rackWidth / 2 + segment / 2 + (slot - 1) * segment;
};

const yForDevice = (rack: IRack, device: IDevice): number => {
  const unitHeight = rackUnitHeight();
  const centerU = device.UPosition + device.UHeight / 2 - 1;
  return -rackHeightFor(rack) / 2 + centerU * unitHeight;
};

const heightForDevice = (device: IDevice): number => Math.max(rackUnitHeight() * device.UHeight, 0.045);

const zForSide = (device: IDevice, selected: boolean): number => {
  const inset = 0.06;
  const base = device.RackSide === 'Rear' ? rackDepth / 2 - deviceDepth / 2 - inset : -rackDepth / 2 + deviceDepth / 2 + inset;
  const emphasis = selected ? 0.04 : 0;
  return device.RackSide === 'Rear' ? base - emphasis : base + emphasis;
};

const sideCameraZ = (rackZPosition: number, rackSide: 'Front' | 'Rear'): number => rackZPosition + (rackSide === 'Rear' ? 5.4 : -5.4);

const activeRackSide = (devices: IDevice[]): 'Front' | 'Rear' => devices.some((device) => device.RackSide === 'Rear') && !devices.some((device) => device.RackSide === 'Front') ? 'Rear' : 'Front';


const normalizeObjectToBox = (object: THREE.Object3D, targetWidth: number, targetHeight: number, targetDepth: number): void => {
  const sourceBox = new THREE.Box3().setFromObject(object);
  const sourceSize = sourceBox.getSize(new THREE.Vector3());
  const safeSize = new THREE.Vector3(Math.max(sourceSize.x, 0.001), Math.max(sourceSize.y, 0.001), Math.max(sourceSize.z, 0.001));
  object.scale.multiply(new THREE.Vector3(targetWidth / safeSize.x, targetHeight / safeSize.y, targetDepth / safeSize.z));
  const scaledBox = new THREE.Box3().setFromObject(object);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
  object.position.sub(scaledCenter);
};

const tintMaterial = (source: THREE.Material | undefined, color: number, selected: boolean): THREE.Material | undefined => {
  if (!source) return source;
  const material = source.clone() as THREE.MeshStandardMaterial;
  if (material.color) material.color.setHex(selected ? 0xffffff : color);
  if (material.emissive) {
    material.emissive = new THREE.Color(selected ? color : 0x000000);
    material.emissiveIntensity = selected ? 0.22 : 0;
  }
  return material;
};

const createTextLabel = (text: string, color: number, userData: { [key: string]: string }): THREE.Sprite | undefined => {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 112;
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  context.fillStyle = 'rgba(5, 12, 22, .9)';
  context.strokeStyle = `#${new THREE.Color(color).getHexString()}`;
  context.lineWidth = 8;
  context.fillRect(6, 6, canvas.width - 12, canvas.height - 12);
  context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
  context.fillStyle = '#ffffff';
  context.font = '700 38px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text.length > 28 ? `${text.slice(0, 27)}…` : text, canvas.width / 2, canvas.height / 2);
  const material = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.05, 0.184, 1);
  sprite.userData = userData;
  sprite.renderOrder = 20;
  return sprite;
};

const tintObject = (object: THREE.Object3D, color: number, selected: boolean): void => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map((material) => tintMaterial(material, color, selected) || material)
      : tintMaterial(mesh.material as THREE.Material, color, selected) || mesh.material;
  });
};


const setModelOpacity = (object: THREE.Object3D, opacity: number): void => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material as THREE.Material];
    materials.forEach((source) => {
      const material = source as THREE.MeshStandardMaterial;
      material.transparent = opacity < 1;
      material.opacity = opacity;
      material.depthWrite = opacity >= 0.98;
      material.side = THREE.DoubleSide;
    });
  });
};

const createSplineBackground = (): THREE.CanvasTexture | undefined => {
  if (typeof document === 'undefined') return undefined;
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#dcc1c1');
  gradient.addColorStop(0.45, '#cdb5b7');
  gradient.addColorStop(1, '#1d2930');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  return texture;
};

const createModelWrapper = (object: THREE.Object3D, userData: { [key: string]: string }): THREE.Group => {
  const wrapper = new THREE.Group();
  wrapper.userData = userData;
  wrapper.add(object);
  return wrapper;
};
const createPrimitiveRack = (rack: IRack, selected: boolean): THREE.Object3D => {
  const group = new THREE.Group();
  const rackHeight = rackHeightFor(rack);
  const frameMaterial = new THREE.MeshStandardMaterial({ color: selected ? 0x6bdcff : 0x22364b, transparent: true, opacity: 0.72, metalness: 0.35, roughness: 0.45 });
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x081522, transparent: true, opacity: 0.18 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth), bodyMaterial);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth)), new THREE.LineBasicMaterial({ color: selected ? 0x6bdcff : 0x6f8daa }));
  const top = new THREE.Mesh(new THREE.BoxGeometry(rackWidth + 0.08, 0.05, rackDepth + 0.08), frameMaterial);
  const bottom = top.clone();
  const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, rackHeight, 0.05), frameMaterial);
  const rightRail = leftRail.clone();
  top.position.y = rackHeight / 2;
  bottom.position.y = -rackHeight / 2;
  leftRail.position.set(-rackWidth / 2, 0, -rackDepth / 2);
  rightRail.position.set(rackWidth / 2, 0, -rackDepth / 2);
  group.add(body, edges, top, bottom, leftRail, rightRail);
  group.userData = { type: 'rack', rackKey: rack.RackKey };
  return group;
};

const createPrimitiveDevice = (rack: IRack, device: IDevice, selected: boolean): THREE.Object3D => {
  const width = widthForMount(device.MountWidth) - 0.03;
  const height = heightForDevice(device) - deviceGap;
  const color = deviceColors[device.DeviceType] || 0x7aa8ff;
  const material = new THREE.MeshStandardMaterial({ color: selected ? 0xffffff : color, emissive: selected ? color : 0x000000, emissiveIntensity: selected ? 0.22 : 0, metalness: 0.25, roughness: 0.5 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, deviceDepth), material);
  mesh.position.set(xForSlot(device.MountWidth, device.HorizontalSlot), yForDevice(rack, device), zForSide(device, selected));
  mesh.userData = { type: 'device', deviceKey: device.DeviceKey, rackKey: device.RackKey };
  return mesh;
};

const ServerRoom3DView: React.FC<IServerRoom3DViewProps> = ({ racks, devices, modelAssets, assetLibraryPath, currentSiteUrl, enableGlbLoading, selectedRackKey, selectedDeviceKey, onRackSelected, onDeviceSelected, onSceneUnavailable }) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const rackObjectsRef = React.useRef<{ [key: string]: THREE.Object3D }>({});
  const deviceObjectsRef = React.useRef<{ [key: string]: THREE.Object3D }>({});
  const cameraTargetRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, -7.2));
  const lookAtTargetRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const focusActiveRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    if (!hostRef.current) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setClearColor(0xf1eeee, 1);
      renderer.shadowMap.enabled = true;
    } catch (error) {
      onSceneUnavailable('3D rendering is unavailable in this browser, so the 2D rack fallback is shown.');
      return undefined;
    }

    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.background = createSplineBackground() || new THREE.Color(0xd8bfc0);
    scene.fog = new THREE.Fog(0xd8bfc0, 7, 20);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.copy(cameraTargetRef.current);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 900, host.clientHeight || 560);
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.rotateSpeed = 0.45;
    controls.zoomSpeed = 0.65;
    controls.panSpeed = 0.55;
    controls.enablePan = true;
    controls.minDistance = 2.1;
    controls.maxDistance = 14;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.target.copy(lookAtTargetRef.current);
    const stopAutomaticFocus = (): void => { focusActiveRef.current = false; };
    controls.addEventListener('start', stopAutomaticFocus);

    scene.add(new THREE.HemisphereLight(0xfff1ef, 0x29383b, 1.85));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.castShadow = true;
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xff8f99, 0.42);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(10, 96), new THREE.MeshStandardMaterial({ color: 0xcab9bb, roughness: 0.9, metalness: 0.02 }));
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -standardRackHeight / 2 - 0.04;
    scene.add(floor);

    const loader = new GLTFLoader();
    const assetCache: { [key: string]: THREE.Object3D | undefined } = {};

    const findAsset = (key: string): IModelAsset | undefined => modelAssets.filter((asset) => asset.ModelAssetKey === key)[0];
    const loadAsset = (assetKey: string, onLoaded: (object: THREE.Object3D) => void): void => {
      if (assetCache[assetKey]) {
        onLoaded(cloneObject(assetCache[assetKey] as THREE.Object3D));
        return;
      }
      if (!enableGlbLoading) return;
      const urls = buildAssetUrls(assetLibraryPath, currentSiteUrl, findAsset(assetKey));
      const tryLoad = (index: number): void => {
        if (index >= urls.length) return;
        loader.load(urls[index], (gltf) => {
          assetCache[assetKey] = gltf.scene;
          onLoaded(cloneObject(gltf.scene));
        }, undefined, () => tryLoad(index + 1));
      };
      tryLoad(0);
    };

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    rackObjectsRef.current = {};
    deviceObjectsRef.current = {};

    racks.forEach((rack) => {
      const rackSelected = selectedRackKey === rack.RackKey && !selectedDeviceKey;
      const rackGroup = new THREE.Group();
      rackGroup.position.set(rack.XPosition, (rackHeightFor(rack) - standardRackHeight) / 2, rack.ZPosition);
      rackGroup.rotation.y = THREE.MathUtils.degToRad(rack.Rotation);
      rackGroup.userData = { type: 'rack', rackKey: rack.RackKey };
      const primitiveRack = createPrimitiveRack(rack, rackSelected);
      rackGroup.add(primitiveRack);
      rackObjectsRef.current[rack.RackKey] = rackGroup;
      roomGroup.add(rackGroup);

      loadAsset(rack.ModelAssetKey, (object) => {
        try {
          normalizeObjectToBox(object, rackWidth, rackHeightFor(rack), rackDepth);
          tintObject(object, rackSelected ? 0x8ce8ff : 0x626773, rackSelected);
          setModelOpacity(object, rackSelected ? 0.98 : 0.9);
          const rackModel = createModelWrapper(object, { type: 'rack', rackKey: rack.RackKey });
          rackGroup.add(rackModel);
          primitiveRack.visible = false;
        } catch (error) {
          primitiveRack.visible = true;
        }
      });

      devices.filter((device) => device.RackKey === rack.RackKey).forEach((device) => {
        const selected = selectedDeviceKey === device.DeviceKey;
        const primitiveDevice = createPrimitiveDevice(rack, device, selected);
        rackGroup.add(primitiveDevice);
        deviceObjectsRef.current[device.DeviceKey] = primitiveDevice;
        loadAsset(device.ModelAssetKey, (object) => {
          try {
            const width = widthForMount(device.MountWidth) - 0.03;
            const deviceModel = new THREE.Group();
            deviceModel.userData = { type: 'device', deviceKey: device.DeviceKey, rackKey: device.RackKey };
            for (let unit = 0; unit < Math.max(1, device.UHeight); unit++) {
              const unitModel = unit === 0 ? object : cloneObject(object);
              normalizeObjectToBox(unitModel, width, rackUnitHeight() - deviceGap, deviceDepth);
              tintObject(unitModel, deviceColors[device.DeviceType] || 0x7aa8ff, selected);
              unitModel.position.y = (unit - (Math.max(1, device.UHeight) - 1) / 2) * rackUnitHeight();
              deviceModel.add(unitModel);
            }
            deviceModel.position.copy(primitiveDevice.position);
            const label = createTextLabel(device.Title, deviceColors[device.DeviceType] || 0x7aa8ff, { type: 'device', deviceKey: device.DeviceKey, rackKey: device.RackKey });
            if (label) {
              label.position.set(0, 0, device.RackSide === 'Rear' ? deviceDepth * 0.66 : -deviceDepth * 0.66);
              deviceModel.add(label);
            }
            rackGroup.add(deviceModel);
            deviceObjectsRef.current[device.DeviceKey] = deviceModel;
            primitiveDevice.visible = false;
          } catch (error) {
            primitiveDevice.visible = true;
          }
        });
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;
    const onPointerDown = (event: PointerEvent): void => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };
    const onPointerUp = (event: PointerEvent): void => {
      if (Math.abs(event.clientX - pointerDownX) + Math.abs(event.clientY - pointerDownY) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(roomGroup.children, true);
      for (let index = 0; index < intersects.length; index++) {
        let current: THREE.Object3D | null = intersects[index].object;
        while (current) {
          if (current.userData.type === 'device') {
            const device = devices.filter((candidate) => candidate.DeviceKey === current.userData.deviceKey)[0];
            if (device) onDeviceSelected(device);
            return;
          }
          if (current.userData.type === 'rack') {
            onRackSelected(current.userData.rackKey);
            return;
          }
          current = current.parent;
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onResize = (): void => {
      if (!host) return;
      const width = host.clientWidth || 900;
      const height = host.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);
    onResize();

    let frameId = 0;
    const animate = (): void => {
      if (focusActiveRef.current) {
        camera.position.lerp(cameraTargetRef.current, 0.055);
        controls.target.lerp(lookAtTargetRef.current, 0.055);
        if (camera.position.distanceTo(cameraTargetRef.current) < 0.015 && controls.target.distanceTo(lookAtTargetRef.current) < 0.015) focusActiveRef.current = false;
      }
      controls.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.removeEventListener('start', stopAutomaticFocus);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [racks, devices, modelAssets, assetLibraryPath, currentSiteUrl, enableGlbLoading, selectedRackKey, selectedDeviceKey, onRackSelected, onDeviceSelected, onSceneUnavailable]);

  React.useEffect(() => {
    const selectedDevice = selectedDeviceKey ? devices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;
    const selectedRack = selectedDevice ? racks.filter((rack) => rack.RackKey === selectedDevice.RackKey)[0] : selectedRackKey ? racks.filter((rack) => rack.RackKey === selectedRackKey)[0] : undefined;
    if (!selectedRack) return;
    const rackSide = selectedDevice ? selectedDevice.RackSide : activeRackSide(devices);
    const rackCenterY = (rackHeightFor(selectedRack) - standardRackHeight) / 2;
    const rackPosition = new THREE.Vector3(selectedRack.XPosition, rackCenterY, selectedRack.ZPosition);
    cameraTargetRef.current = new THREE.Vector3(selectedRack.XPosition, rackCenterY + rackHeightFor(selectedRack) * 0.32, sideCameraZ(selectedRack.ZPosition, rackSide));
    lookAtTargetRef.current = rackPosition;
    focusActiveRef.current = true;
  }, [racks, devices, selectedRackKey, selectedDeviceKey]);

  return <div className={styles.threeHost} ref={hostRef} aria-label="3D server room view" />;
};

export default ServerRoom3DView;
