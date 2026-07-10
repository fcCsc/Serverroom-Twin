import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import styles from './ServerRoomDigitalTwin.module.scss';
import { DeviceType, IInfraDevice, IInfraRack, IRackPlacement, MountWidth, RackMountSide } from '../models/ServerRoomModels';
import { getPlacementDevice, getRackPlacements, getUsedUnits, placementVisibleOnSide } from '../utils/rackUtils';

const useGlbAssets = true;
const assetBaseUrl = 'assets/glb/';
const rackFrameAssetName = 'rack-frame.glb';
const normalBlockAssetName = 'block-normal.glb';
const smallBlockAssetName = 'block-small.glb';
const fallbackToProceduralBlocks = true;
const unitHeight = 1;
const rackInnerWidth = 4;
const rackInnerDepth = 2;
const rackReferenceHeightU = 42;

type GlbAssetKind = 'rack' | 'normal' | 'small';
type NormalizedTemplate = { object: THREE.Object3D; source: 'glb' | 'fallback' };

const deviceTypeColors: { [key: string]: number } = {
  Firewall: 0xff4d4d,
  Switch: 0xffd84d,
  Server: 0x49d17d,
  Backup: 0xa36dff,
  Storage: 0x4da3ff,
  UPS: 0x9a6244,
  USV: 0x9a6244,
  PatchPanel: 0x9aa4af,
  Patch: 0x9aa4af,
  Unknown: 0x6f8fa8,
  Normal: 0x6f8fa8
};

const glbCache: { [key: string]: Promise<NormalizedTemplate | undefined> } = {};

const getAssetFileName = (kind: GlbAssetKind): string => kind === 'rack' ? rackFrameAssetName : kind === 'normal' ? normalBlockAssetName : smallBlockAssetName;
const cloneObject = (object: THREE.Object3D): THREE.Object3D => object.clone(true);
const colorForDeviceType = (type: DeviceType | string): number => deviceTypeColors[type] || deviceTypeColors.Unknown;

const normalizeObject = (object: THREE.Object3D, targetWidth: number, targetHeight: number, targetDepth: number): THREE.Object3D => {
  const normalized = new THREE.Group();
  normalized.add(object);
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  if (size.x === 0 || size.y === 0 || size.z === 0) return normalized;
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= box.min.y;
  const scale = Math.min(targetWidth / size.x, targetHeight / size.y, targetDepth / size.z);
  object.scale.multiplyScalar(scale);
  return normalized;
};

const createFallbackBox = (kind: GlbAssetKind, color: number): THREE.Object3D => {
  const size: [number, number, number] = kind === 'rack' ? [rackInnerWidth + 0.55, rackReferenceHeightU, rackInnerDepth + 0.42] : kind === 'normal' ? [rackInnerWidth, unitHeight * 0.82, rackInnerDepth * 0.82] : [rackInnerWidth / 2 - 0.12, unitHeight * 0.78, rackInnerDepth * 0.78];
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: kind === 'rack' ? 0.24 : 0.1, transparent: kind === 'rack', opacity: kind === 'rack' ? 0.26 : 0.92 });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.y = size[1] / 2;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(size[0], size[1], size[2])), new THREE.LineBasicMaterial({ color: kind === 'rack' ? 0x7fd2ff : 0xffffff, transparent: true, opacity: kind === 'rack' ? 0.54 : 0.24 }));
  edges.position.copy(mesh.position);
  const group = new THREE.Group();
  group.add(mesh, edges);
  return group;
};

const loadGlb = (loader: GLTFLoader, kind: GlbAssetKind): Promise<NormalizedTemplate | undefined> => {
  const fileName = getAssetFileName(kind);
  const url = `${assetBaseUrl}${fileName}`;
  if (!useGlbAssets) return Promise.resolve(undefined);
  if (!glbCache[url]) {
    glbCache[url] = new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => {
          const height = kind === 'rack' ? rackReferenceHeightU : unitHeight;
          const width = kind === 'small' ? rackInnerWidth / 2 : rackInnerWidth;
          resolve({ object: normalizeObject(gltf.scene, width, height, rackInnerDepth), source: 'glb' });
        },
        undefined,
        () => resolve(undefined)
      );
    });
  }
  return glbCache[url];
};

const getTemplate = async (loader: GLTFLoader, kind: GlbAssetKind, color: number): Promise<NormalizedTemplate> => {
  const loaded = await loadGlb(loader, kind);
  if (loaded) return loaded;
  return { object: createFallbackBox(kind, color), source: 'fallback' };
};

const recolorObject = (object: THREE.Object3D, color: number, transparentRack = false): void => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.14, transparent: transparentRack, opacity: transparentRack ? 0.34 : 0.94, emissive: color, emissiveIntensity: transparentRack ? 0.02 : 0.05 });
  });
};

const makeLabel = (text: string, width = 768, height = 192): THREE.Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = 'rgba(255, 250, 244, 0.88)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(23, 42, 70, 0.18)';
    context.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    context.fillStyle = '#172133';
    context.font = '800 42px Segoe UI, Arial, sans-serif';
    const lines = text.split('\n').slice(0, 3);
    lines.forEach((line, index) => context.fillText(line, 28, 62 + index * 50));
  }
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(width / 260, height / 260, 1);
  return sprite;
};

const widthFactor = (mountWidth?: MountWidth): number => ({ Full: 1, Half: 0.5, Third: 1 / 3, Quarter: 0.25 }[mountWidth || 'Full']);
const blockKind = (mountWidth?: MountWidth): GlbAssetKind => mountWidth === 'Full' || !mountWidth ? 'normal' : 'small';

const laneX = (mountWidth?: MountWidth, horizontalSlot?: number): number => {
  const factor = widthFactor(mountWidth);
  const laneWidth = rackInnerWidth * factor;
  const maxSlots = Math.max(Math.round(1 / factor), 1);
  const slot = Math.min(Math.max(horizontalSlot || 1, 1), maxSlots);
  return -rackInnerWidth / 2 + laneWidth / 2 + (slot - 1) * laneWidth;
};

const createUnitMarkers = (rack: IInfraRack): THREE.Group => {
  const group = new THREE.Group();
  for (let unit = 1; unit <= rack.heightU; unit++) {
    const y = (unit - 1) * unitHeight;
    const marker = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-rackInnerWidth / 2 - 0.22, y, -rackInnerDepth / 2 - 0.05), new THREE.Vector3(rackInnerWidth / 2 + 0.22, y, -rackInnerDepth / 2 - 0.05)]),
      new THREE.LineBasicMaterial({ color: unit % 5 === 0 ? 0x2f6f9e : 0xb9b1af, transparent: true, opacity: unit % 5 === 0 ? 0.48 : 0.2 })
    );
    group.add(marker);
    if (unit === 1 || unit === rack.heightU || unit % 5 === 0) {
      const label = makeLabel(`U${String(unit).padStart(2, '0')}`, 256, 96);
      label.position.set(-rackInnerWidth / 2 - 0.78, y + 0.35, -rackInnerDepth / 2 - 0.18);
      label.scale.set(0.65, 0.24, 1);
      group.add(label);
    }
  }
  return group;
};

interface IGlbDummyVisualizerProps {
  racks: IInfraRack[];
  devices: IInfraDevice[];
  placements: IRackPlacement[];
  selectedRackId: string | null;
  selectedDeviceId?: string | null;
  mode: 'room' | 'focus';
  rackSide?: RackMountSide;
  onRackSelected?: (rackId: string) => void;
  onDeviceSelected?: (deviceId: string) => void;
}

const GlbDummyVisualizer: React.FC<IGlbDummyVisualizerProps> = ({ racks, devices, placements, selectedRackId, selectedDeviceId, mode, rackSide = 'front', onRackSelected, onDeviceSelected }) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [loadState, setLoadState] = React.useState<string>('Lade GLB-Dummy-Assets...');
  const [hoverText, setHoverText] = React.useState<string>('Rack anklicken für Fokusmodus');

  React.useEffect(() => {
    if (!hostRef.current) return undefined;
    const host = hostRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd8cfcc);
    const width = host.clientWidth || 960;
    const height = host.clientHeight || 620;
    const camera = new THREE.OrthographicCamera(width / -95, width / 95, height / 95, height / -95, 0.1, 200);
    camera.position.set(mode === 'focus' ? 9 : 12, mode === 'focus' ? 24 : 18, mode === 'focus' ? 20 : 17);
    camera.lookAt(0, mode === 'focus' ? 14 : 8, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x7b6e68, 2.1));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.25);
    keyLight.position.set(10, 22, 14);
    scene.add(keyLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 28), new THREE.MeshStandardMaterial({ color: 0xd8cfcc, roughness: 0.84, metalness: 0.02 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const grid = new THREE.GridHelper(40, 40, 0xb9b1af, 0xc8c0bd);
    grid.position.y = 0.01;
    scene.add(grid);

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    const loader = new GLTFLoader();
    const rackClickTargets: THREE.Object3D[] = [];
    const deviceClickTargets: THREE.Object3D[] = [];
    let mounted = true;

    const addDevice = async (rackGroup: THREE.Group, rack: IInfraRack, placement: IRackPlacement): Promise<void> => {
      if (!placementVisibleOnSide(placement, rackSide)) return;
      const device = getPlacementDevice(placement, devices);
      if (!device) return;
      const heightU = placement.heightU || 1;
      const mountWidth = placement.mountWidth || 'Full';
      const kind = blockKind(mountWidth);
      const color = colorForDeviceType(device.type);
      const template = await getTemplate(loader, kind, color);
      const deviceGroup = new THREE.Group();
      deviceGroup.userData = { type: 'device', deviceId: device.id, rackId: rack.id };
      const isSelected = selectedDeviceId === device.id;
      for (let offset = 0; offset < heightU; offset++) {
        const block = cloneObject(template.object);
        recolorObject(block, isSelected ? 0xffffff : color);
        block.scale.set(widthFactor(mountWidth) * (kind === 'small' ? 2 : 1), 0.92, 1);
        block.position.set(laneX(mountWidth, placement.horizontalSlot), (placement.startU - 1 + offset) * unitHeight + 0.5, -rackInnerDepth / 2 - 0.18);
        block.userData = { type: 'device', deviceId: device.id, rackId: rack.id };
        deviceGroup.add(block);
      }
      const labelText = `${device.hostname}
${device.type} · U${placement.startU}/${heightU}U${heightU > 2 ? `
${device.vendor} ${device.model}` : ''}`;
      const label = makeLabel(labelText);
      label.position.set(laneX(mountWidth, placement.horizontalSlot), (placement.startU - 1) * unitHeight + heightU + 0.44, -rackInnerDepth / 2 - 0.86);
      label.scale.set(mountWidth === 'Full' ? 2.15 : 1.25, heightU > 2 ? 0.72 : 0.48, 1);
      deviceGroup.add(label);
      rackGroup.add(deviceGroup);
      deviceClickTargets.push(deviceGroup);
    };

    const addRack = async (rack: IInfraRack, index: number): Promise<void> => {
      const rackPlacements = getRackPlacements(rack.id, placements);
      const rackTemplate = await getTemplate(loader, 'rack', 0x78cfff);
      const rackGroup = new THREE.Group();
      const rackShell = cloneObject(rackTemplate.object);
      recolorObject(rackShell, selectedRackId === rack.id ? 0x3fc7ff : 0x78cfff, true);
      const rackScaleY = rack.heightU / rackReferenceHeightU;
      rackShell.scale.set(1, rackScaleY, 1);
      rackShell.userData = { type: 'rack', rackId: rack.id };
      rackGroup.add(rackShell);
      rackGroup.add(createUnitMarkers(rack));
      rackGroup.userData = { type: 'rack', rackId: rack.id };
      rackClickTargets.push(rackShell, rackGroup);

      const label = makeLabel(`${rack.name}\n${rack.heightU}U · ${rack.room}`);
      label.position.set(0, rack.heightU + 1.6, -0.95);
      label.scale.set(2.2, 0.8, 1);
      rackGroup.add(label);

      await Promise.all(rackPlacements.map((placement) => addDevice(rackGroup, rack, placement)));

      if (mode === 'focus') {
        rackGroup.position.set(0, 0, 0);
        rackGroup.scale.setScalar(0.44);
      } else {
        rackGroup.position.set((rack.positionX - 48) / 4.2, 0, (rack.positionY - 35) / 3.8 + index * 0.08);
        rackGroup.rotation.y = -0.54;
        rackGroup.scale.setScalar(0.16 + Math.min(rack.heightU, 48) / 360);
      }
      roomGroup.add(rackGroup);
    };

    const visibleRacks = mode === 'focus' ? racks.filter((rack) => rack.id === selectedRackId) : racks;
    Promise.all(visibleRacks.map(addRack)).then(() => {
      if (mounted) setLoadState(fallbackToProceduralBlocks ? 'GLB Block Visualizer bereit · fehlende GLBs nutzen prozedurale Fallback-Blöcke.' : 'GLB Block Visualizer bereit.');
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent, click: boolean): void => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const deviceHit = raycaster.intersectObjects(deviceClickTargets, true)[0];
      if (deviceHit) {
        let target: THREE.Object3D | null = deviceHit.object;
        while (target && !target.userData.deviceId) target = target.parent;
        const deviceId = target ? target.userData.deviceId : undefined;
        const device = devices.filter((item) => item.id === deviceId)[0];
        if (device) setHoverText(`${device.hostname} · ${device.type} · ${device.ipAddress}`);
        if (click && deviceId && onDeviceSelected) onDeviceSelected(deviceId);
        return;
      }
      const rackHit = raycaster.intersectObjects(rackClickTargets, true)[0];
      if (rackHit) {
        let target: THREE.Object3D | null = rackHit.object;
        while (target && !target.userData.rackId) target = target.parent;
        const rackId = target ? target.userData.rackId : undefined;
        const rack = racks.filter((item) => item.id === rackId)[0];
        if (rack) setHoverText(`${rack.name} · ${rack.room} · ${rack.heightU}U · ${getUsedUnits(getRackPlacements(rack.id, placements))}U belegt`);
        if (click && rackId && mode === 'room' && onRackSelected) onRackSelected(rackId);
        return;
      }
      setHoverText(mode === 'room' ? 'Rack anklicken für Fokusmodus' : 'Device anklicken für Detailpanel');
    };

    const onMove = (event: PointerEvent): void => onPointer(event, false);
    const onClick = (event: PointerEvent): void => onPointer(event, true);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('click', onClick);

    const onResize = (): void => {
      const nextWidth = host.clientWidth || 960;
      const nextHeight = host.clientHeight || 620;
      camera.left = nextWidth / -95;
      camera.right = nextWidth / 95;
      camera.top = nextHeight / 95;
      camera.bottom = nextHeight / -95;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', onResize);
    onResize();

    let frameId = 0;
    const animate = (): void => {
      if (mode === 'room') roomGroup.rotation.y = Math.sin(Date.now() * 0.00035) * 0.06;
      camera.lookAt(0, mode === 'focus' ? 10 : 5, 0);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('click', onClick);
      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [devices, mode, onDeviceSelected, onRackSelected, placements, rackSide, racks, selectedRackId]);

  return <section className={`${styles.glbVisualizer} ${mode === 'focus' ? styles.glbFocus : ''}`}><div ref={hostRef} className={styles.glbCanvas} /><div className={styles.glbOverlay}><span>GLB Block Visualizer Preview v1</span><strong>{mode === 'focus' ? 'Rack Focus Mode' : 'Room Overview Mode'}</strong><p>{hoverText}</p><p>{loadState}</p><small>{assetBaseUrl}{rackFrameAssetName} · {normalBlockAssetName} · {smallBlockAssetName}</small></div></section>;
};

export default GlbDummyVisualizer;
