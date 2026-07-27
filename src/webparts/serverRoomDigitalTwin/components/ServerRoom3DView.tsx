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

// Rack.glb is authored side-on. After turning it 90 degrees its original depth
// is the visible rack width and its original width is the room depth.
const rackModelRotationY = Math.PI / 2;
const rackWidth = 1.4274;
const rackDepth = 1.1587;
const standardRackHeight = 4.2972;
const standardRackUnits = 42;
const rackInteriorWidth = rackWidth * 0.88;
const nativeRackUnitHeight = standardRackHeight / standardRackUnits;
const panelDepth = rackDepth / 2;
const panelCenterOffset = rackDepth / 4;
const panelEdgeGap = 0.006;
const panelVerticalFillFactor = 1.1;

const deviceColors: { [key: string]: number } = {
  Backup: 0x6f0013,
  Firewall: 0xff161f,
  Switch: 0xffd900,
  Server: 0x00c82f,
  UPS: 0xffd900,
  Storage: 0x0078c8,
  PatchPanel: 0x0078c8
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

const widthForMount = (mountWidth: MountWidth): number => rackInteriorWidth / slotCountByMountWidth[mountWidth];
const rackHeightFor = (rack: IRack): number => standardRackHeight * Math.max(1, rack.RackHeightU) / standardRackUnits;
const rackUnitHeight = (): number => nativeRackUnitHeight;

interface IRackMountArea {
  mountBottomY: number;
  mountTopY: number;
  unitHeight: number;
}

/** Rack-local 42U rail coordinates; cabinet roof geometry is not a slot reference. */
const mountAreaFor = (rack: IRack): IRackMountArea => {
  const rackUnits = Math.max(1, rack.RackHeightU);
  const unitHeight = rackUnitHeight();
  const mountBottomY = -rackHeightFor(rack) / 2;
  return { mountBottomY, mountTopY: mountBottomY + rackUnits * unitHeight, unitHeight };
};

const xForSlot = (mountWidth: MountWidth, horizontalSlot: number): number => {
  const slots = slotCountByMountWidth[mountWidth];
  const slot = Math.max(1, Math.min(horizontalSlot, slots));
  const segment = rackInteriorWidth / slots;
  return -rackInteriorWidth / 2 + segment / 2 + (slot - 1) * segment;
};

const yForDevice = (rack: IRack, device: IDevice): number => {
  const { mountTopY, unitHeight } = mountAreaFor(rack);
  const highestValidStart = Math.max(1, rack.RackHeightU - device.UHeight + 1);
  const normalizedUPosition = THREE.MathUtils.clamp(device.UPosition, 1, highestValidStart);
  const slotIndexFromTop = rack.RackHeightU - normalizedUPosition - device.UHeight + 1;

  if (normalizedUPosition !== device.UPosition) {
    console.warn('Device U position is outside the rack mount area; using the nearest valid slot.', {
      rack: rack.Title,
      device: device.Title,
      requestedUPosition: device.UPosition,
      normalizedUPosition
    });
  }

  return mountTopY - (slotIndexFromTop + device.UHeight / 2) * unitHeight;
};

const heightForDevice = (device: IDevice): number => Math.max(rackUnitHeight() * device.UHeight * panelVerticalFillFactor, 0.045);

const zForSide = (device: IDevice, selected: boolean): number => {
  const base = device.RackSide === 'Rear' ? panelCenterOffset : -panelCenterOffset;
  const emphasis = selected ? 0.08 : 0;
  return device.RackSide === 'Rear' ? base + emphasis : base - emphasis;
};

const sideCameraZ = (rackZPosition: number, rackSide: 'Front' | 'Rear'): number => rackZPosition + (rackSide === 'Rear' ? 4.4 : -4.4);

const activeRackSide = (devices: IDevice[]): 'Front' | 'Rear' => devices.some((device) => device.RackSide === 'Rear') && !devices.some((device) => device.RackSide === 'Front') ? 'Rear' : 'Front';


const centerObject = (object: THREE.Object3D): void => {
  const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
  object.position.sub(center);
};

const stackEpsilon = 0.0001;
const stackNodeNames = ['STACK_BODY', 'STACK_BOUNDS'];

interface IStackMetrics {
  stackNode: THREE.Object3D;
  box: THREE.Box3;
  size: THREE.Vector3;
  center: THREE.Vector3;
  bottomY: number;
  topY: number;
  height: number;
}

const isStackNodeName = (name: string): boolean => stackNodeNames.some((stackName) => name === stackName || name.startsWith(`${stackName}_`));

const findStackNode = (panel: THREE.Object3D): THREE.Object3D => {
  let result: THREE.Object3D | undefined;
  panel.traverse((child) => {
    if (result) return;
    const name = (child.name || '').toUpperCase();
    if (isStackNodeName(name)) result = child;
  });
  if (!result) throw new Error(`Kein STACK_BODY oder STACK_BOUNDS in "${panel.name || 'panel'}" gefunden.`);
  return result;
};

const getWorldBox = (node: THREE.Object3D): THREE.Box3 => {
  node.updateWorldMatrix(true, true);
  const worldBox = new THREE.Box3();
  node.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (!mesh.geometry.boundingBox) return;
    worldBox.union(mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
  });
  if (worldBox.isEmpty()) throw new Error(`Keine Geometrie in "${node.name || 'stack node'}" gefunden.`);
  return worldBox;
};

const getStackMetrics = (panel: THREE.Object3D): IStackMetrics => {
  const stackNode = findStackNode(panel);
  const box = getWorldBox(stackNode);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  return {
    stackNode,
    box,
    size,
    center,
    bottomY: box.min.y,
    topY: box.max.y,
    height: size.y
  };
};

const translateInWorldSpace = (object: THREE.Object3D, deltaWorld: THREE.Vector3): void => {
  object.updateWorldMatrix(true, false);
  const newWorldPosition = object.getWorldPosition(new THREE.Vector3()).add(deltaWorld);
  if (object.parent) {
    object.parent.updateWorldMatrix(true, false);
    object.parent.worldToLocal(newWorldPosition);
  }
  object.position.copy(newWorldPosition);
  object.updateWorldMatrix(true, true);
};

const stackPanels = (panels: THREE.Object3D[], options: { baseY?: number; gap?: number; targetCenterX?: number; targetCenterZ?: number } = {}): THREE.Box3 => {
  const { baseY = 0, gap = 0, targetCenterX = 0, targetCenterZ = 0 } = options;
  const stackedBodyBox = new THREE.Box3();
  let previousTopY: number | undefined;

  panels.forEach((panel, index) => {
    let metrics = getStackMetrics(panel);
    const targetBottomY = index === 0 || previousTopY === undefined ? baseY : previousTopY + gap;

    translateInWorldSpace(panel, new THREE.Vector3(
      targetCenterX - metrics.center.x,
      targetBottomY - metrics.bottomY,
      targetCenterZ - metrics.center.z
    ));

    metrics = getStackMetrics(panel);
    const actualGap = previousTopY === undefined ? undefined : metrics.bottomY - previousTopY;
    const fullVisualBox = new THREE.Box3().setFromObject(panel, true);
    // Debug output deliberately compares body-only stacking with the complete
    // visual box, so studs/logos can overlap while body edges stay flush.
    console.log({
      panel: panel.name,
      bodyMin: metrics.box.min.toArray(),
      bodyMax: metrics.box.max.toArray(),
      bodyHeight: metrics.height,
      actualBodyGap: actualGap,
      gapCorrect: actualGap === undefined || Math.abs(actualGap - gap) <= stackEpsilon,
      fullVisualMin: fullVisualBox.min.toArray(),
      fullVisualMax: fullVisualBox.max.toArray()
    });
    if (metrics.stackNode.name.toUpperCase().startsWith('STACK_BOUNDS')) metrics.stackNode.visible = false;
    stackedBodyBox.union(metrics.box);
    previousTopY = metrics.topY;
  });

  return stackedBodyBox;
};

/** Fit a rack GLB without stretching the authored proportions. */
const prepareRackModel = (object: THREE.Object3D, rack: IRack): THREE.Object3D => {
  // Face the cabinet openings towards the front/rear device planes.
  // Device positions deliberately remain independent of this model
  // correction, so front and rear panels may share the same U level.
  object.rotation.y = rackModelRotationY;
  centerObject(object);

  const size = new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3());
  const rackModel = new THREE.Group();
  rackModel.add(object);
  const uniformScale = rackHeightFor(rack) / Math.max(size.y, 0.001);
  rackModel.scale.setScalar(uniformScale);
  return rackModel;
};

/** Orient one authored Spline panel as a rack blade without changing its proportions. */
const preparePanelModel = (object: THREE.Object3D): THREE.Object3D => {
  // The exported panel GLBs already contain the intended proportions, colors
  // and surface details. Only rotate the authored long axis across the rack and
  // center the object; slot positioning and U stacking happen on the wrapper.
  object.rotation.y = Math.PI / 2;
  centerObject(object);
  const panel = new THREE.Group();
  panel.add(object);
  return panel;
};

const enableModelShadows = (object: THREE.Object3D): void => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
  const frameMaterial = new THREE.MeshStandardMaterial({ color: selected ? 0x7a8294 : 0x454b55, transparent: true, opacity: 0.68, metalness: 0.72, roughness: 0.18 });
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2d3435, transparent: true, opacity: 0.16, metalness: 0.55, roughness: 0.22 });
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
  const width = widthForMount(device.MountWidth);
  const height = heightForDevice(device);
  const color = deviceColors[device.DeviceType] || 0x7aa8ff;
  const material = new THREE.MeshStandardMaterial({ color: selected ? 0xffffff : color, emissive: color, emissiveIntensity: selected ? 0.45 : 0.08, metalness: 0.24, roughness: 0.34 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width - panelEdgeGap * 2, height, panelDepth - panelEdgeGap * 2), material);
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

    let disposed = false;
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
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 2.4;
    controls.maxDistance = 10;
    controls.target.copy(lookAtTargetRef.current);

    scene.add(new THREE.HemisphereLight(0xfff1ef, 0x29383b, 1.85));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.castShadow = true;
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xff8f99, 0.42);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);
    if (racks.length === 0) {
      onSceneUnavailable('No racks are available for the selected room.');
      return () => {
        disposed = true;
        renderer.dispose();
        if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
      };
    }

    const minX = Math.min(...racks.map((rack) => rack.XPosition));
    const maxX = Math.max(...racks.map((rack) => rack.XPosition));
    const minZ = Math.min(...racks.map((rack) => rack.ZPosition));
    const maxZ = Math.max(...racks.map((rack) => rack.ZPosition));
    const floorWidth = Math.max(18, (maxX - minX) + rackWidth + 5);
    const floorDepth = Math.max(14, (maxZ - minZ) + rackDepth + 5);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorWidth, floorDepth), new THREE.MeshStandardMaterial({ color: 0xd2bcbc, roughness: 0.82, metalness: 0.04 }));
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2;
    floor.position.set((minX + maxX) / 2, -standardRackHeight / 2 - 0.04, (minZ + maxZ) / 2);
    scene.add(floor);

    const loader = new GLTFLoader();
    const assetCache: { [key: string]: THREE.Object3D | undefined } = {};

    const findAsset = (key: string): IModelAsset | undefined => modelAssets.filter((asset) => asset.ModelAssetKey === key)[0];
    const loadAsset = (assetKey: string, onLoaded: (object: THREE.Object3D) => void): void => {
      if (disposed) return;
      if (assetCache[assetKey]) {
        onLoaded(cloneObject(assetCache[assetKey] as THREE.Object3D));
        return;
      }
      if (!enableGlbLoading) return;
      const urls = buildAssetUrls(assetLibraryPath, currentSiteUrl, findAsset(assetKey));
      const tryLoad = (index: number): void => {
        if (disposed || index >= urls.length) return;
        loader.load(urls[index], (gltf) => {
          if (disposed) return;
          assetCache[assetKey] = gltf.scene;
          onLoaded(cloneObject(gltf.scene));
        }, undefined, () => { if (!disposed) tryLoad(index + 1); });
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
          const preparedRack = prepareRackModel(object, rack);
          enableModelShadows(preparedRack);
          const rackModel = createModelWrapper(preparedRack, { type: 'rack', rackKey: rack.RackKey });
          rackGroup.add(rackModel);
          // Keep the procedural rack in the scene as a permanent safety layer.
          // On GitHub Pages the GLB files can load slightly later (or with
          // browser/GPU-specific material quirks), and replacing the primitive
          // immediately made the preview appear to flash briefly and then go
          // black. Leaving the primitive visible guarantees the room remains
          // inspectable even when an authored GLB is too dark or incomplete.
          primitiveRack.visible = true;
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
            const preparedPanel = preparePanelModel(object);
            const deviceModel = new THREE.Group();
            deviceModel.userData = { type: 'device', deviceKey: device.DeviceKey, rackKey: device.RackKey };

            // A panel model represents one rack pitch. Multi-U devices are
            // assembled from repeated authored panels. Bounds-based stacking
            // places each next panel exactly on top of the previous model.
            const panels: THREE.Object3D[] = [];
            for (let unitOffset = 0; unitOffset < device.UHeight; unitOffset++) {
              const panel = unitOffset === 0 ? preparedPanel : cloneObject(preparedPanel);
              enableModelShadows(panel);
              panel.position.y = unitOffset * rackUnitHeight();
              deviceModel.add(panel);
              panels.push(panel);
            }
            const stackedBounds = stackPanels(panels, { baseY: 0, gap: 0, targetCenterX: 0, targetCenterZ: 0 });
            const stackedCenter = stackedBounds.getCenter(new THREE.Vector3());
            deviceModel.position.set(
              xForSlot(device.MountWidth, device.HorizontalSlot),
              yForDevice(rack, device) - stackedCenter.y,
              zForSide(device, selected)
            );
            rackGroup.add(deviceModel);
            deviceObjectsRef.current[device.DeviceKey] = deviceModel;
            // Keep the color-coded primitive device visible so the rack
            // inventory never disappears if a GLB panel renders black or
            // fails after an initial successful request on static hosting.
            primitiveDevice.visible = true;
          } catch (error) {
            primitiveDevice.visible = true;
          }
        });
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerStart = new THREE.Vector2();
    const onPointerDown = (event: PointerEvent): void => {
      pointerStart.set(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent): void => {
      // OrbitControls also starts on pointer-down. Only select when the pointer
      // was released as a click, so dragging the room never opens a device.
      if (pointerStart.distanceTo(new THREE.Vector2(event.clientX, event.clientY)) > 5) return;
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
    let renderedFrames = 0;
    const reportBlackFrameIfNeeded = (): void => {
      renderedFrames += 1;
      if (renderedFrames !== 45) return;
      try {
        const context = renderer.getContext();
        const width = context.drawingBufferWidth;
        const height = context.drawingBufferHeight;
        if (width < 3 || height < 3) return;
        const pixels = new Uint8Array(3 * 3 * 4);
        context.readPixels(Math.floor(width / 2) - 1, Math.floor(height / 2) - 1, 3, 3, context.RGBA, context.UNSIGNED_BYTE, pixels);
        let luminance = 0;
        for (let index = 0; index < pixels.length; index += 4) luminance += pixels[index] + pixels[index + 1] + pixels[index + 2];
        if (luminance / (pixels.length / 4) < 9) onSceneUnavailable('The 3D canvas rendered black in this browser, so the rack elevation fallback is shown.');
      } catch (error) {
        onSceneUnavailable('3D rendering could not be verified, so the rack elevation fallback is shown.');
      }
    };
    const onContextLost = (event: Event): void => {
      event.preventDefault();
      onSceneUnavailable('3D rendering lost its WebGL context, so the rack elevation fallback is shown.');
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    const animate = (): void => {
      if (focusActiveRef.current) {
        camera.position.lerp(cameraTargetRef.current, 0.055);
        controls.target.lerp(lookAtTargetRef.current, 0.055);
        if (camera.position.distanceTo(cameraTargetRef.current) < 0.015 && controls.target.distanceTo(lookAtTargetRef.current) < 0.015) focusActiveRef.current = false;
      }
      try {
        controls.update();
        renderer.render(scene, camera);
        reportBlackFrameIfNeeded();
        frameId = window.requestAnimationFrame(animate);
      } catch (error) {
        focusActiveRef.current = false;
        onSceneUnavailable('3D rendering stopped unexpectedly, so please use the rack elevation fallback.');
      }
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
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
