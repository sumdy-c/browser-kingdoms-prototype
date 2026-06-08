import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  PointerEventTypes,
  Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import type { BuildRequest, Building, BuildingCatalogItem, BuildingType, Castle, Country, Resources } from '../types';
import { BUILDING_LABELS } from '../types';

interface CastleSceneProps {
  castle: Castle;
  country?: Country;
  buildingCatalog: Record<BuildingType, BuildingCatalogItem>;
  onBack: () => void;
  onBuild: (request: BuildRequest) => void;
}

const buildingTypes = Object.keys(BUILDING_LABELS) as BuildingType[];

const materialColors: Record<BuildingType | 'ground' | 'grid' | 'wall', Color3> = {
  house: new Color3(0.65, 0.49, 0.32),
  farm: new Color3(0.38, 0.62, 0.31),
  warehouse: new Color3(0.55, 0.46, 0.36),
  lumberyard: new Color3(0.45, 0.28, 0.13),
  quarry: new Color3(0.42, 0.45, 0.49),
  market: new Color3(0.73, 0.52, 0.24),
  barracks: new Color3(0.55, 0.19, 0.18),
  archeryRange: new Color3(0.34, 0.48, 0.24),
  watchtower: new Color3(0.45, 0.45, 0.52),
  ground: new Color3(0.22, 0.3, 0.24),
  grid: new Color3(0.75, 0.75, 0.65),
  wall: new Color3(0.36, 0.36, 0.4),
};

function formatCost(cost: Partial<Resources>) {
  const labels = {
    gold: 'зол',
    food: 'еды',
    wood: 'дер',
    stone: 'кам',
    population: 'нас',
  };

  return Object.entries(cost)
    .map(([key, value]) => `${value} ${labels[key as keyof typeof labels]}`)
    .join(' · ');
}

function canAfford(resources: Resources | undefined, cost: Partial<Resources>) {
  if (!resources) {
    return false;
  }

  return Object.entries(cost).every(([key, value]) => resources[key as keyof Resources] >= (value ?? 0));
}

function createMaterial(scene: Scene, name: string, color: Color3) {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = new Color3(0.12, 0.12, 0.12);
  return material;
}

function createBuilding(scene: Scene, building: Building, parent: Mesh, materials: Record<string, StandardMaterial>, index: number) {
  const root = new Mesh(`building-root-${building.id}`, scene);
  const fallbackX = -5 + (index % 6) * 2;
  const fallbackZ = -3 + Math.floor(index / 6) * 2;
  root.parent = parent;
  root.position = new Vector3(typeof building.x === 'number' ? building.x : fallbackX, 0, typeof building.z === 'number' ? building.z : fallbackZ);
  root.rotation.y = building.rotation ?? 0;

  if (building.type === 'watchtower') {
    const tower = MeshBuilder.CreateCylinder(`tower-${building.id}`, { diameter: 0.9, height: 2.8, tessellation: 16 }, scene);
    tower.parent = root;
    tower.position.y = 1.4;
    tower.material = materials.watchtower;

    const roof = MeshBuilder.CreateCylinder(`tower-roof-${building.id}`, { diameterTop: 0, diameterBottom: 1.25, height: 0.85, tessellation: 16 }, scene);
    roof.parent = root;
    roof.position.y = 3.2;
    roof.material = materials.house;
    return root;
  }

  if (building.type === 'farm') {
    const field = MeshBuilder.CreateBox(`farm-field-${building.id}`, { width: 2.4, height: 0.08, depth: 1.8 }, scene);
    field.parent = root;
    field.position.y = 0.04;
    field.material = materials.farm;

    const barn = MeshBuilder.CreateBox(`farm-barn-${building.id}`, { width: 1.1, height: 0.7, depth: 0.9 }, scene);
    barn.parent = root;
    barn.position = new Vector3(-0.55, 0.42, 0);
    barn.material = materials.house;
    return root;
  }

  const sizes: Record<BuildingType, { width: number; height: number; depth: number }> = {
    house: { width: 1.2, height: 0.9, depth: 1.1 },
    farm: { width: 1.6, height: 0.6, depth: 1.2 },
    warehouse: { width: 1.8, height: 1.1, depth: 1.35 },
    lumberyard: { width: 1.7, height: 0.7, depth: 1.2 },
    quarry: { width: 1.4, height: 0.75, depth: 1.4 },
    market: { width: 1.8, height: 0.9, depth: 1.6 },
    barracks: { width: 2.2, height: 1.0, depth: 1.1 },
    archeryRange: { width: 2.2, height: 0.7, depth: 1.4 },
    watchtower: { width: 1, height: 2.2, depth: 1 },
  };

  const size = sizes[building.type];
  const body = MeshBuilder.CreateBox(`body-${building.id}`, size, scene);
  body.parent = root;
  body.position.y = size.height / 2;
  body.material = materials[building.type];

  if (building.type === 'house' || building.type === 'warehouse' || building.type === 'barracks' || building.type === 'market') {
    const roof = MeshBuilder.CreateCylinder(`roof-${building.id}`, {
      diameter: Math.max(size.width, size.depth) * 1.15,
      height: 0.65,
      tessellation: 3,
    }, scene);
    roof.parent = root;
    roof.position.y = size.height + 0.35;
    roof.rotation.z = Math.PI / 2;
    roof.material = materials.house;
  }

  if (building.type === 'lumberyard') {
    for (let i = 0; i < 4; i += 1) {
      const log = MeshBuilder.CreateCylinder(`log-${building.id}-${i}`, { diameter: 0.18, height: 1.6, tessellation: 8 }, scene);
      log.parent = root;
      log.position = new Vector3(-0.45 + i * 0.3, 0.2, 0.75);
      log.rotation.z = Math.PI / 2;
      log.material = materials.house;
    }
  }

  if (building.type === 'quarry') {
    for (let i = 0; i < 5; i += 1) {
      const stone = MeshBuilder.CreateSphere(`stone-${building.id}-${i}`, { diameter: 0.25 + i * 0.03, segments: 8 }, scene);
      stone.parent = root;
      stone.position = new Vector3(-0.6 + i * 0.3, 0.16, 0.65 - (i % 2) * 0.3);
      stone.material = materials.quarry;
    }
  }

  if (building.type === 'archeryRange') {
    for (let i = 0; i < 5; i += 1) {
      const target = MeshBuilder.CreateCylinder(`target-${building.id}-${i}`, { diameter: 0.28, height: 0.08, tessellation: 16 }, scene);
      target.parent = root;
      target.position = new Vector3(-0.8 + i * 0.4, 0.45, 0.72);
      target.rotation.x = Math.PI / 2;
      target.material = materials.barracks;
    }
  }

  return root;
}

export function CastleScene({ castle, country, buildingCatalog, onBack, onBuild }: CastleSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const buildingsRootRef = useRef<Mesh | null>(null);
  const [selectedType, setSelectedType] = useState<BuildingType>('house');
  const selectedTypeRef = useRef<BuildingType>('house');

  const selectedCost = useMemo(() => buildingCatalog[selectedType].cost, [buildingCatalog, selectedType]);
  const hasResources = canAfford(country?.resources, selectedCost);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  const renderBuildings = useCallback(() => {
    const scene = sceneRef.current;
    const root = buildingsRootRef.current;

    if (!scene || !root) {
      return;
    }

    root.getChildren().forEach((node) => node.dispose());

    const materials = {
      house: createMaterial(scene, 'mat-house', materialColors.house),
      farm: createMaterial(scene, 'mat-farm', materialColors.farm),
      warehouse: createMaterial(scene, 'mat-warehouse', materialColors.warehouse),
      lumberyard: createMaterial(scene, 'mat-lumberyard', materialColors.lumberyard),
      quarry: createMaterial(scene, 'mat-quarry', materialColors.quarry),
      market: createMaterial(scene, 'mat-market', materialColors.market),
      barracks: createMaterial(scene, 'mat-barracks', materialColors.barracks),
      archeryRange: createMaterial(scene, 'mat-archery-range', materialColors.archeryRange),
      watchtower: createMaterial(scene, 'mat-watchtower', materialColors.watchtower),
    };

    castle.buildings.forEach((building, index) => createBuilding(scene, building, root, materials, index));
  }, [castle.buildings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.05, 0.07, 0.1, 1);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2.4, Math.PI / 2.8, 20, new Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 9;
    camera.upperRadiusLimit = 35;
    camera.wheelPrecision = 45;

    new HemisphericLight('light', new Vector3(0.2, 1, 0.4), scene).intensity = 0.9;

    const groundMaterial = createMaterial(scene, 'ground-material', materialColors.ground);
    const wallMaterial = createMaterial(scene, 'wall-material', materialColors.wall);
    const gridMaterial = createMaterial(scene, 'grid-material', materialColors.grid);
    gridMaterial.alpha = 0.35;

    const ground = MeshBuilder.CreateGround('build-ground', { width: 16, height: 16 }, scene);
    ground.material = groundMaterial;

    const wallA = MeshBuilder.CreateBox('wall-north', { width: 16.5, height: 1.2, depth: 0.35 }, scene);
    wallA.position = new Vector3(0, 0.6, -8.25);
    wallA.material = wallMaterial;
    const wallB = wallA.clone('wall-south');
    wallB.position.z = 8.25;
    const wallC = MeshBuilder.CreateBox('wall-west', { width: 0.35, height: 1.2, depth: 16.5 }, scene);
    wallC.position = new Vector3(-8.25, 0.6, 0);
    wallC.material = wallMaterial;
    const wallD = wallC.clone('wall-east');
    wallD.position.x = 8.25;

    for (let i = -8; i <= 8; i += 1) {
      const lineX = MeshBuilder.CreateLines(`grid-x-${i}`, { points: [new Vector3(i, 0.03, -8), new Vector3(i, 0.03, 8)] }, scene);
      lineX.color = materialColors.grid;
      const lineZ = MeshBuilder.CreateLines(`grid-z-${i}`, { points: [new Vector3(-8, 0.03, i), new Vector3(8, 0.03, i)] }, scene);
      lineZ.color = materialColors.grid;
    }

    const root = new Mesh('buildings-root', scene);
    buildingsRootRef.current = root;
    sceneRef.current = scene;

    scene.onPointerObservable.add((eventData) => {
      if (eventData.type !== PointerEventTypes.POINTERPICK) {
        return;
      }

      const pick = eventData.pickInfo;
      if (!pick?.hit || pick.pickedMesh?.name !== 'build-ground' || !pick.pickedPoint) {
        return;
      }

      const x = Math.round(pick.pickedPoint.x);
      const z = Math.round(pick.pickedPoint.z);

      if (Math.abs(x) > 7 || Math.abs(z) > 7) {
        return;
      }

      onBuild({
        castleId: castle.id,
        holdingId: castle.id,
        type: selectedTypeRef.current,
        x,
        z,
        rotation: 0,
      });
    });

    engine.runRenderLoop(() => scene.render());

    const resize = () => engine.resize();
    window.addEventListener('resize', resize);
    renderBuildings();

    return () => {
      window.removeEventListener('resize', resize);
      scene.dispose();
      engine.dispose();
      sceneRef.current = null;
      buildingsRootRef.current = null;
    };
  }, [castle.id, onBuild, renderBuildings]);

  useEffect(() => {
    renderBuildings();
  }, [renderBuildings]);

  return (
    <div className="castle-screen">
      <div className="castle-topbar">
        <button className="secondary-button" onClick={onBack}>← На карту</button>
        <div>
          <strong>{castle.name}</strong>
          <span>{country ? country.name : 'Нейтральная область'} · {castle.buildings.length} построек</span>
        </div>
      </div>

      <div className="castle-layout">
        <aside className="build-panel">
          <div className="panel-title">Строительство</div>
          <div className="build-list">
            {buildingTypes.map((type) => {
              const affordable = canAfford(country?.resources, buildingCatalog[type].cost);
              return (
                <button
                  className={selectedType === type ? 'build-button build-button-active' : 'build-button'}
                  key={type}
                  onClick={() => setSelectedType(type)}
                >
                  <strong>{BUILDING_LABELS[type]}</strong>
                  <span>{formatCost(buildingCatalog[type].cost)}</span>
                  {!affordable && <small>мало ресурсов</small>}
                </button>
              );
            })}
          </div>
          <div className={hasResources ? 'hint' : 'hint hint-warning'}>
            Выбрано: {BUILDING_LABELS[selectedType]}. Кликни по клетке внутри стен, чтобы построить.
          </div>
        </aside>

        <canvas className="castle-canvas" ref={canvasRef} />
      </div>
    </div>
  );
}
