import * as React from 'react';
import * as THREE from 'three';
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
const rackHeight = 3.4;
const deviceDepth = 0.18;
const focusAnimationSpeed = 0.08;

const deviceColors: { [key: string]: number } = {
  Server: 0x59b6ff,
  Switch: 0x62e6bd,
  Storage: 0xb692ff,
  Firewall: 0xff9f6e,
  UPS: 0xf6d365,
  PatchPanel: 0xd7e3f4
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
  if (asset.DefaultForDeviceType === 'Rack' || key === 'rack') return unique([...defaultNames, 'rack-frame.glb', 'rack-cabinet.glb']);
  if (key === 'switch' || key === 'patchpanel') return unique([...defaultNames, 'block-small.glb', 'block-normal.glb']);
  return unique([...defaultNames, 'block-normal.glb', 'block-small.glb']);
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

const xForSlot = (mountWidth: MountWidth, horizontalSlot: number): number => {
  const slots = slotCountByMountWidth[mountWidth];
  const slot = Math.max(1, Math.min(horizontalSlot, slots));
  const segment = rackWidth / slots;
  return -rackWidth / 2 + segment / 2 + (slot - 1) * segment;
};

const yForDevice = (rack: IRack, device: IDevice): number => {
  const unitHeight = rackHeight / rack.RackHeightU;
  const centerU = device.UPosition + device.UHeight / 2 - 1;
  return -rackHeight / 2 + centerU * unitHeight;
};

const heightForDevice = (rack: IRack, device: IDevice): number => Math.max((rackHeight / rack.RackHeightU) * device.UHeight, 0.045);

const zForSide = (device: IDevice, selected: boolean): number => {
  const base = device.RackSide === 'Rear' ? rackDepth / 2 + deviceDepth / 2 : -rackDepth / 2 - deviceDepth / 2;
  const emphasis = selected ? 0.2 : 0;
  return device.RackSide === 'Rear' ? base + emphasis : base - emphasis;
};

const createPrimitiveRack = (rack: IRack, selected: boolean): THREE.Object3D => {
  const group = new THREE.Group();
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
  const height = heightForDevice(rack, device) - 0.01;
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
  const cameraTargetRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 2.5, 6));
  const lookAtTargetRef = React.useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  React.useEffect(() => {
    if (!hostRef.current) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
      onSceneUnavailable('3D rendering is unavailable in this browser, so the 2D rack fallback is shown.');
      return undefined;
    }

    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.copy(cameraTargetRef.current);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth || 900, host.clientHeight || 560);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xddeeff, 0x0b1020, 1.9));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x6bdcff, 0.55);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({ color: 0x071827, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -rackHeight / 2 - 0.04;
    scene.add(floor);
    const grid = new THREE.GridHelper(12, 12, 0x315270, 0x183049);
    grid.position.y = floor.position.y + 0.01;
    scene.add(grid);

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
      rackGroup.position.set(rack.XPosition, 0, rack.ZPosition);
      rackGroup.rotation.y = THREE.MathUtils.degToRad(rack.Rotation);
      rackGroup.userData = { type: 'rack', rackKey: rack.RackKey };
      const primitiveRack = createPrimitiveRack(rack, rackSelected);
      rackGroup.add(primitiveRack);
      rackObjectsRef.current[rack.RackKey] = rackGroup;
      roomGroup.add(rackGroup);

      loadAsset(rack.ModelAssetKey, (object) => {
        primitiveRack.visible = false;
        object.scale.set(1, rackHeight, 1);
        object.userData = { type: 'rack', rackKey: rack.RackKey };
        rackGroup.add(object);
      });

      devices.filter((device) => device.RackKey === rack.RackKey).forEach((device) => {
        const selected = selectedDeviceKey === device.DeviceKey;
        const primitiveDevice = createPrimitiveDevice(rack, device, selected);
        rackGroup.add(primitiveDevice);
        deviceObjectsRef.current[device.DeviceKey] = primitiveDevice;
        loadAsset(device.ModelAssetKey, (object) => {
          const width = widthForMount(device.MountWidth) - 0.03;
          object.position.copy(primitiveDevice.position);
          object.scale.set(width, heightForDevice(rack, device), deviceDepth);
          object.userData = { type: 'device', deviceKey: device.DeviceKey, rackKey: device.RackKey };
          primitiveDevice.visible = false;
          rackGroup.add(object);
          deviceObjectsRef.current[device.DeviceKey] = object;
        });
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent): void => {
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
      camera.position.lerp(cameraTargetRef.current, focusAnimationSpeed);
      camera.lookAt(lookAtTargetRef.current);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [racks, devices, modelAssets, assetLibraryPath, currentSiteUrl, enableGlbLoading, selectedRackKey, selectedDeviceKey, onRackSelected, onDeviceSelected, onSceneUnavailable]);

  React.useEffect(() => {
    const selectedDevice = selectedDeviceKey ? devices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;
    const selectedRack = selectedDevice ? racks.filter((rack) => rack.RackKey === selectedDevice.RackKey)[0] : selectedRackKey ? racks.filter((rack) => rack.RackKey === selectedRackKey)[0] : undefined;
    if (!selectedRack) return;
    const rackPosition = new THREE.Vector3(selectedRack.XPosition, 0, selectedRack.ZPosition);
    cameraTargetRef.current = new THREE.Vector3(selectedRack.XPosition, 1.7, selectedRack.ZPosition + 4.4);
    lookAtTargetRef.current = rackPosition;
  }, [racks, devices, selectedRackKey, selectedDeviceKey]);

  return <div className={styles.threeHost} ref={hostRef} aria-label="3D server room view" />;
};

export default ServerRoom3DView;
