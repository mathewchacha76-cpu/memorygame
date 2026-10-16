import * as THREE from 'three';

export const CELL = 12;
export const FLOOR_HEIGHT = 5.8;
export const PLAYER_HEIGHT = 1.68;
const CITY_SPACING = CELL + 4;
const WALL_HEIGHT = 4.5;
const WALL_THICKNESS = 0.32;
const DOOR_WIDTH = 2.65;

export const LEVELS = [
  { name: 'The Small Mansion', title: 'Beginner', cols: 3, rows: 3, floors: 1, loops: 1, briefing: 38, search: 240, hints: 3, target: 'the Golden Crown', artifact: 'crown' },
  { name: 'The Grand House', title: 'Explorer', cols: 3, rows: 3, floors: 2, loops: 3, briefing: 32, search: 230, hints: 2, target: 'the Moonstone', artifact: 'gem' },
  { name: 'The Royal Mansion', title: 'Adventurer', cols: 4, rows: 4, floors: 2, loops: 4, briefing: 27, search: 210, hints: 2, target: 'the Lost Manuscript', artifact: 'book' },
  { name: 'The Gilded Palace', title: 'Expert', cols: 5, rows: 4, floors: 3, loops: 7, briefing: 22, search: 190, hints: 1, target: 'the Starfall Relic', artifact: 'orb' },
  { name: 'The Lost City', title: 'Master', cols: 7, rows: 7, floors: 1, loops: 8, briefing: 18, search: 180, hints: 1, target: 'the Royal Treasure Chest', artifact: 'chest', city: true, spacing: CITY_SPACING }
];

const roomThemes = [
  { name: 'Grand Entrance', floor: '#705d49', wall: '#c3b59a', trim: '#987447', kind: 'entrance' },
  { name: 'Library', floor: '#503b2f', wall: '#766047', trim: '#bc8b4e', kind: 'library' },
  { name: 'Portrait Gallery', floor: '#65544a', wall: '#b69e7e', trim: '#a8794c', kind: 'gallery' },
  { name: 'Dining Room', floor: '#65513c', wall: '#a8916e', trim: '#d0a54d', kind: 'dining' },
  { name: 'Blue Salon', floor: '#485260', wall: '#75828a', trim: '#c09a60', kind: 'salon' },
  { name: 'Conservatory', floor: '#4d5b44', wall: '#7c9476', trim: '#c7a866', kind: 'garden' },
  { name: 'Bedchamber', floor: '#655766', wall: '#8d7880', trim: '#c29b67', kind: 'bedroom' },
  { name: 'Music Room', floor: '#51434c', wall: '#88777c', trim: '#c6a567', kind: 'music' },
  { name: 'Antique Study', floor: '#574943', wall: '#94816e', trim: '#c89d5d', kind: 'study' },
  { name: 'East Gallery', floor: '#645445', wall: '#af9d82', trim: '#d2ae69', kind: 'gallery' },
  { name: 'Winter Garden', floor: '#4e625a', wall: '#83948a', trim: '#c8b574', kind: 'garden' },
  { name: 'Secret Chamber', floor: '#46434a', wall: '#6e6770', trim: '#d7a94f', kind: 'treasury' },
  { name: 'Map Room', floor: '#4c514f', wall: '#85887a', trim: '#c4a065', kind: 'study' },
  { name: 'Ballroom', floor: '#645349', wall: '#b29b83', trim: '#d6b46a', kind: 'dining' },
  { name: 'Old Observatory', floor: '#434a58', wall: '#697586', trim: '#d2b678', kind: 'observatory' },
  { name: 'Museum Hall', floor: '#534c4a', wall: '#928477', trim: '#cba25e', kind: 'gallery' },
  { name: 'Natural History Museum', floor: '#5a5048', wall: '#9d8b76', trim: '#d2ae69', kind: 'gallery' },
  { name: 'Riverside Market', floor: '#5d5143', wall: '#a58b67', trim: '#d7b66e', kind: 'dining' },
  { name: 'Old Town Bank', floor: '#4d4b48', wall: '#9b9080', trim: '#c2a35f', kind: 'study' },
  { name: 'Lantern Hotel', floor: '#564b50', wall: '#9a8082', trim: '#d0a66a', kind: 'salon' },
  { name: 'Crown Street Library', floor: '#4e3c31', wall: '#827052', trim: '#c6944f', kind: 'library' },
  { name: 'City Conservatory', floor: '#455345', wall: '#71836f', trim: '#c8ae67', kind: 'garden' },
  { name: 'The Clocktower', floor: '#4d4c51', wall: '#87817a', trim: '#c4a76a', kind: 'observatory' },
  { name: 'Old City Museum', floor: '#5c5147', wall: '#98866f', trim: '#d1a95e', kind: 'gallery' },
  { name: 'Central Hospital', floor: '#577075', wall: '#a0b1ad', trim: '#c2af78', kind: 'study' },
  { name: 'Riverside Restaurant', floor: '#5e4937', wall: '#9d8060', trim: '#d4a45b', kind: 'dining' },
  { name: 'Maple Apartments', floor: '#55444e', wall: '#8a7783', trim: '#c9a56a', kind: 'bedroom' },
  { name: 'Civic School', floor: '#514c42', wall: '#97896f', trim: '#d0b064', kind: 'study' },
  { name: 'Lantern Street Shops', floor: '#5d4843', wall: '#a37e66', trim: '#d4ad69', kind: 'salon' },
  { name: 'City Hall', floor: '#5c554b', wall: '#a09279', trim: '#d7b775', kind: 'gallery' },
  { name: 'Founders Park Pavilion', floor: '#4b5e4f', wall: '#7e927c', trim: '#d3b676', kind: 'garden' },
  { name: 'Northside Offices', floor: '#4c5760', wall: '#84949d', trim: '#c6a566', kind: 'study' }
];

const landmarkNames = [
  'The Blue Peacock', 'The Marble Stag', 'The Moon Clock', 'The Glass Fountain',
  'The Golden Harp', 'The Rose Window', 'The Atlas Globe', 'The Bronze Owl'
];

function roomId(floor, index) {
  return `${floor}:${index}`;
}

function cellPosition(config, floor, index) {
  const col = index % config.cols;
  const row = Math.floor(index / config.cols);
  const spacing = config.spacing || CELL;
  return new THREE.Vector3(
    (col - (config.cols - 1) / 2) * spacing,
    floor * FLOOR_HEIGHT,
    (row - (config.rows - 1) / 2) * spacing
  );
}

function addBox(parent, geometry, material, position, scale) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.scale.set(scale.x, scale.y, scale.z);
  mesh.castShadow = scale.y > 0.45;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addPointLight(parent, color, intensity, distance, position) {
  const light = new THREE.PointLight(color, intensity, distance, 2);
  light.position.set(position.x, position.y, position.z);
  parent.add(light);
  return light;
}

function buildConnections(config, random) {
  const roomCount = config.cols * config.rows;
  const edges = new Map();
  const adjacency = new Map();
  for (let floor = 0; floor < config.floors; floor++) {
    for (let index = 0; index < roomCount; index++) adjacency.set(roomId(floor, index), []);
  }

  const addEdge = (from, to, type = 'door') => {
    const key = `${from}|${to}`;
    if (edges.has(key)) return;
    edges.set(key, { from, to, type });
    adjacency.get(from).push(to);
    adjacency.get(to).push(from);
  };

  for (let floor = 0; floor < config.floors; floor++) {
    if (config.city) {
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          const index = row * config.cols + col;
          if (col < config.cols - 1) addEdge(roomId(floor, index), roomId(floor, index + 1));
          if (row < config.rows - 1) addEdge(roomId(floor, index), roomId(floor, index + config.cols));
        }
      }
      continue;
    }
    let remainingLoops = config.loops;
    const visited = new Set();
    const start = roomId(floor, random(roomCount));
    const stack = [start];
    visited.add(start);
    while (stack.length) {
      const current = stack[stack.length - 1];
      const [, rawIndex] = current.split(':');
      const index = Number(rawIndex);
      const col = index % config.cols;
      const row = Math.floor(index / config.cols);
      const neighbors = [];
      if (col > 0) neighbors.push(roomId(floor, index - 1));
      if (col < config.cols - 1) neighbors.push(roomId(floor, index + 1));
      if (row > 0) neighbors.push(roomId(floor, index - config.cols));
      if (row < config.rows - 1) neighbors.push(roomId(floor, index + config.cols));
      const fresh = neighbors.filter((neighbor) => !visited.has(neighbor));
      if (!fresh.length) {
        stack.pop();
        continue;
      }
      const next = fresh[random(fresh.length)];
      addEdge(current, next);
      visited.add(next);
      stack.push(next);
    }

    const allPairs = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        const index = row * config.cols + col;
        if (col < config.cols - 1) allPairs.push([roomId(floor, index), roomId(floor, index + 1)]);
        if (row < config.rows - 1) allPairs.push([roomId(floor, index), roomId(floor, index + config.cols)]);
      }
    }
    for (const [from, to] of allPairs.sort(() => random(2) - 0.5)) {
      if (edges.has(`${from}|${to}`) || edges.has(`${to}|${from}`)) continue;
      if (remainingLoops <= 0) break;
      addEdge(from, to);
      remainingLoops -= 1;
    }
  }

  for (let floor = 0; floor < config.floors - 1; floor++) {
    addEdge(roomId(floor, 0), roomId(floor + 1, 0), 'stair');
  }

  return { edges: [...edges.values()], adjacency };
}

function buildWall(parent, colliders, boxGeometry, material, x, y, z, width, height, depth, floor) {
  addBox(parent, boxGeometry, material, new THREE.Vector3(x, y + height / 2, z), new THREE.Vector3(width, height, depth));
  colliders.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2, floor });
}

function buildWallWithDoor(parent, colliders, geometry, material, x, y, z, width, horizontal, hasDoor, floor) {
  if (!hasDoor) {
    buildWall(parent, colliders, geometry, material, x, y, z, horizontal ? width : WALL_THICKNESS, WALL_HEIGHT, horizontal ? WALL_THICKNESS : width, floor);
    return;
  }
  const passageWidth = width - DOOR_WIDTH;
  const segment = passageWidth / 2;
  const sideOffset = (DOOR_WIDTH + segment) / 2;
  const sideScale = horizontal
    ? [segment, WALL_HEIGHT, WALL_THICKNESS]
    : [WALL_THICKNESS, WALL_HEIGHT, segment];
  addBox(parent, geometry, material, new THREE.Vector3(x + (horizontal ? -sideOffset : 0), y + WALL_HEIGHT / 2, z + (horizontal ? 0 : -sideOffset)), new THREE.Vector3(...sideScale));
  addBox(parent, geometry, material, new THREE.Vector3(x + (horizontal ? sideOffset : 0), y + WALL_HEIGHT / 2, z + (horizontal ? 0 : sideOffset)), new THREE.Vector3(...sideScale));
  for (const side of [-1, 1]) {
    const segmentX = x + (horizontal ? side * sideOffset : 0);
    const segmentZ = z + (horizontal ? 0 : side * sideOffset);
    colliders.push({
      minX: segmentX - (horizontal ? segment / 2 : WALL_THICKNESS / 2),
      maxX: segmentX + (horizontal ? segment / 2 : WALL_THICKNESS / 2),
      minZ: segmentZ - (horizontal ? WALL_THICKNESS / 2 : segment / 2),
      maxZ: segmentZ + (horizontal ? WALL_THICKNESS / 2 : segment / 2),
      floor
    });
  }
  const headerHeight = 0.62;
  const headerY = y + WALL_HEIGHT - headerHeight / 2;
  addBox(parent, geometry, material, new THREE.Vector3(x, headerY, z), new THREE.Vector3(
    horizontal ? DOOR_WIDTH : WALL_THICKNESS,
    headerHeight,
    horizontal ? WALL_THICKNESS : DOOR_WIDTH
  ));
  colliders.push({
    minX: x - (horizontal ? DOOR_WIDTH / 2 : WALL_THICKNESS / 2),
    maxX: x + (horizontal ? DOOR_WIDTH / 2 : WALL_THICKNESS / 2),
    minZ: z - (horizontal ? WALL_THICKNESS / 2 : DOOR_WIDTH / 2),
    maxZ: z + (horizontal ? WALL_THICKNESS / 2 : DOOR_WIDTH / 2),
    floor,
    minY: y + WALL_HEIGHT - headerHeight
  });
}

function addPlant(parent, geometry, materials, position, scale = 1) {
  const soil = addBox(
    parent,
    geometry,
    materials.pot,
    new THREE.Vector3(position.x, position.y + 0.22 * scale, position.z),
    new THREE.Vector3(0.66 * scale, 0.42 * scale, 0.66 * scale)
  );
  soil.castShadow = true;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * scale, 0.09 * scale, 0.82 * scale, 7), materials.wood);
  trunk.position.set(position.x, position.y + 0.82 * scale, position.z);
  trunk.castShadow = true;
  parent.add(trunk);
  for (let i = 0; i < 3; i++) {
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48 * scale, 0), materials.leaf);
    leaves.position.set(position.x + (i - 1) * 0.22 * scale, position.y + (1 + (i % 2) * 0.42) * scale, position.z + (1 - i) * 0.12 * scale);
    leaves.castShadow = true;
    parent.add(leaves);
  }
}

function buildFurniture(parent, colliders, geometries, mats, theme, center, random) {
  const { box, cylinder } = geometries;
  const x = center.x;
  const z = center.z;
  const y = center.y;
  const addFurniture = (material, px, pz, sx, sy, sz, obstacle = true) => {
    addBox(parent, box, material, new THREE.Vector3(px, y + sy / 2, pz), new THREE.Vector3(sx, sy, sz));
    if (obstacle) colliders.push({
      minX: px - sx / 2 - 0.16,
      maxX: px + sx / 2 + 0.16,
      minZ: pz - sz / 2 - 0.16,
      maxZ: pz + sz / 2 + 0.16,
      floor: Math.round(y / FLOOR_HEIGHT)
    });
  };

  const alongWall = x + (random(2) ? -3.5 : 3.5);
  if (theme.kind === 'library' || theme.kind === 'study') {
    addFurniture(mats.woodDark, alongWall, z - 3.25, 1.55, 3.3, 2.1);
    addFurniture(mats.wood, x + 1.5, z + 1.2, 2.2, 0.82, 1.3);
    addFurniture(mats.woodDark, x - 2.5, z + 2.8, 0.75, 0.72, 0.75);
    addFurniture(mats.gold, x - 2.8, z - 2.25, 0.24, 1.1, 0.8, false);
  } else if (theme.kind === 'gallery' || theme.kind === 'observatory') {
    addFurniture(mats.gold, x, z, 0.9, 1.25, 0.9);
    addFurniture(mats.stone, alongWall, z + 3.6, 0.2, 2.6, 2.15, false);
    addFurniture(mats.gold, x - 2.5, z - 3, 0.22, 1.25, 0.85, false);
  } else if (theme.kind === 'dining') {
    addFurniture(mats.woodDark, x, z - 0.4, 3.1, 0.86, 2.2);
    for (const [dx, dz] of [[-2, -1.7], [0, -1.7], [2, -1.7], [-2, 0.9], [0, 0.9], [2, 0.9]]) {
      addFurniture(mats.wood, x + dx, z + dz, 0.64, 0.82, 0.64);
    }
  } else if (theme.kind === 'bedroom') {
    addFurniture(mats.woodDark, x, z - 1.8, 3.1, 0.62, 3.1);
    addFurniture(mats.fabric, x, z - 1.75, 2.86, 0.48, 2.8, false);
    addFurniture(mats.wood, x - 3.35, z + 2.8, 0.78, 0.76, 0.78);
    addFurniture(mats.wood, x + 3.35, z + 2.8, 0.78, 0.76, 0.78);
  } else if (theme.kind === 'garden') {
    addPlant(parent, geometries.box, mats, new THREE.Vector3(x - 3.4, y, z - 3.2), 1.1);
    addPlant(parent, geometries.box, mats, new THREE.Vector3(x + 3.4, y, z - 3.1), 1);
    addFurniture(mats.stone, x, z + 1.8, 2.1, 0.64, 0.72);
    const fountain = new THREE.Mesh(cylinder, mats.water);
    fountain.position.set(x, y + 0.16, z - 0.1);
    fountain.scale.set(1.15, 1, 1.15);
    fountain.receiveShadow = true;
    parent.add(fountain);
  } else if (theme.kind === 'treasury') {
    addFurniture(mats.gold, x - 2.8, z - 2.7, 0.55, 1.15, 0.55);
    addFurniture(mats.gold, x + 2.8, z - 2.7, 0.55, 1.15, 0.55);
    addFurniture(mats.woodDark, x, z + 3.1, 2.4, 1.4, 1.1);
    addFurniture(mats.stone, x - 2.7, z + 2.7, 0.7, 1.1, 0.7);
    addFurniture(mats.stone, x + 2.7, z + 2.7, 0.7, 1.1, 0.7);
  } else if (theme.kind === 'salon' || theme.kind === 'entrance' || theme.kind === 'music') {
    addFurniture(mats.fabric, x - 2.7, z - 2.6, 2.35, 0.86, 0.92);
    addFurniture(mats.fabric, x + 2.7, z - 2.6, 2.35, 0.86, 0.92);
    addFurniture(mats.wood, x, z + 2.7, 1.65, 0.7, 1.65);
    if (theme.kind === 'music') addFurniture(mats.woodDark, x + 3.4, z + 1.6, 1.7, 0.9, 1.1);
  } else {
    addFurniture(mats.wood, x - 3.3, z - 3, 1.4, 0.9, 1.4);
    addFurniture(mats.stone, x + 3, z + 2.7, 1.35, 1.3, 1.35);
  }
}

function makeArtifact(type, mats) {
  const group = new THREE.Group();
  const gold = mats.artifactGold;
  const gem = mats.artifactGem;
  const center = new THREE.Vector3(0, 1.1, 0);
  if (type === 'crown') {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.09, 9, 20), gold);
    band.rotation.x = Math.PI / 2;
    band.position.copy(center);
    group.add(band);
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const point = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.54, 5), gold);
      point.position.set(Math.cos(angle) * 0.42, 1.34 + (i % 2) * 0.07, Math.sin(angle) * 0.42);
      group.add(point);
    }
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(0.19, 1), gem);
    stone.position.set(0, 1.2, 0.48);
    group.add(stone);
  } else if (type === 'gem') {
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.78, 1), gem);
    jewel.position.copy(center);
    jewel.scale.set(0.78, 1.08, 0.78);
    group.add(jewel);
    const setting = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 8, 28), gold);
    setting.rotation.x = Math.PI / 2;
    setting.position.copy(center);
    group.add(setting);
  } else if (type === 'book') {
    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.2, 1.42), gold);
    cover.position.set(0, 1, 0);
    cover.rotation.y = -0.18;
    group.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 1.25), mats.pages);
    pages.position.set(0, 1.09, 0);
    pages.rotation.y = -0.18;
    group.add(pages);
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), gem);
    jewel.position.set(0, 1.22, 0);
    group.add(jewel);
  } else if (type === 'chest') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.82, 0.94), gold);
    base.position.set(0, 0.85, 0);
    group.add(base);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.28, 1), gold);
    lid.position.set(0, 1.38, 0);
    group.add(lid);
    const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.21, 1), gem);
    jewel.position.set(0, 1.5, 0.51);
    group.add(jewel);
  } else {
    const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.63, 2), gem);
    orb.position.copy(center);
    group.add(orb);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 8, 32), gold);
    ring.position.copy(center);
    ring.rotation.x = 0.8;
    group.add(ring);
    const secondRing = ring.clone();
    secondRing.rotation.set(-0.6, 0, 0.7);
    group.add(secondRing);
  }
  group.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  return group;
}

export class Mansion {
  constructor(scene, levelIndex, seed = Math.floor(Math.random() * 1e9)) {
    this.scene = scene;
    this.levelIndex = levelIndex;
    this.config = { ...LEVELS[levelIndex] };
    this.random = this.createRandom(seed);
    this.colliders = [];
    this.nodes = new Map();
    this.landmarks = [];
    this.ceilings = [];
    this.animatables = [];
    this.routeObjects = [];
    this.group = new THREE.Group();
    this.group.name = 'Procedural mansion';
    this.scene.add(this.group);
    this.materials = this.createMaterials();
    this.geometries = {
      box: new THREE.BoxGeometry(1, 1, 1),
      cylinder: new THREE.CylinderGeometry(0.88, 1.05, 0.35, 20)
    };
    const layout = buildConnections(this.config, this.random);
    this.edges = layout.edges;
    this.adjacency = layout.adjacency;
    this.buildFloors();
    this.buildEnvironment();
    this.buildStaircases();
    this.targetId = this.chooseTarget();
    this.targetRoom = this.nodes.get(this.targetId);
    this.buildLandmarks();
    this.targetObject = makeArtifact(this.config.artifact, this.materials);
    this.targetObject.position.copy(this.targetRoom.position);
    this.targetObject.position.y += 0.05;
    this.targetObject.visible = false;
    this.targetObject.name = 'Hidden treasure';
    this.group.add(this.targetObject);
    const aura = new THREE.PointLight(0x65d9ff, 1.2, 7, 2);
    aura.position.set(0, 1.7, 0);
    this.targetObject.add(aura);
    this.animatables.push(this.targetObject);
    this.buildCollectibles();
    this.route = this.findPath('0:0', this.targetId);
    if (!this.route) {
      throw new Error('The mansion layout has no valid route to its treasure. Please restart the level.');
    }
    this.createRoutePreview();
    this.hideRoute();
  }

  createRandom(seed) {
    let value = seed >>> 0;
    return (maximum) => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value % maximum;
    };
  }

  createMaterials() {
    const mats = {
      floor: new Map(),
      wall: new Map(),
      trim: new Map(),
      stone: new THREE.MeshStandardMaterial({ color: '#b3aa96', roughness: 0.75 }),
      wood: new THREE.MeshStandardMaterial({ color: '#785539', roughness: 0.69 }),
      woodDark: new THREE.MeshStandardMaterial({ color: '#473126', roughness: 0.65 }),
      fabric: new THREE.MeshStandardMaterial({ color: '#95686c', roughness: 0.91 }),
      gold: new THREE.MeshStandardMaterial({ color: '#c09b54', metalness: 0.6, roughness: 0.35, emissive: '#513408', emissiveIntensity: 0.12 }),
      pot: new THREE.MeshStandardMaterial({ color: '#71504a', roughness: 0.88 }),
      leaf: new THREE.MeshStandardMaterial({ color: '#496f4e', roughness: 0.8 }),
      water: new THREE.MeshStandardMaterial({ color: '#598da1', metalness: 0.4, roughness: 0.2, emissive: '#0c4556', emissiveIntensity: 0.25 }),
      artifactGold: new THREE.MeshStandardMaterial({ color: '#e6b95d', metalness: 0.83, roughness: 0.22, emissive: '#805009', emissiveIntensity: 0.35 }),
      artifactGem: new THREE.MeshStandardMaterial({ color: '#66dcff', metalness: 0.3, roughness: 0.12, emissive: '#08799d', emissiveIntensity: 1.1 }),
      pages: new THREE.MeshStandardMaterial({ color: '#e2d3a9', roughness: 0.8 }),
      asphalt: new THREE.MeshStandardMaterial({ color: '#29333a', roughness: 0.92 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: '#a69c89', roughness: 0.9 }),
      roadMark: new THREE.MeshStandardMaterial({ color: '#d8c68e', roughness: 0.75, emissive: '#423a20', emissiveIntensity: 0.12 }),
      cityGround: new THREE.MeshStandardMaterial({ color: '#64705f', roughness: 1 }),
      citySign: new THREE.MeshStandardMaterial({ color: '#20333c', metalness: 0.25, roughness: 0.55 }),
      route: new THREE.MeshBasicMaterial({ color: 0xffca75, transparent: true, opacity: 0.88 }),
      beacon: new THREE.MeshBasicMaterial({ color: 0xffd581, transparent: true, opacity: 0.9 })
    };
    for (const theme of roomThemes) {
      mats.floor.set(theme.kind + theme.name, new THREE.MeshStandardMaterial({ color: theme.floor, roughness: 0.85 }));
      mats.wall.set(theme.name, new THREE.MeshStandardMaterial({ color: theme.wall, roughness: 0.88 }));
      mats.trim.set(theme.name, new THREE.MeshStandardMaterial({ color: theme.trim, metalness: 0.24, roughness: 0.52 }));
    }
    return mats;
  }

  buildFloors() {
    const { config, random, group, materials: mats, geometries } = this;
    for (let floor = 0; floor < config.floors; floor++) {
      const y = floor * FLOOR_HEIGHT;
      for (let index = 0; index < config.cols * config.rows; index++) {
        const position = cellPosition(config, floor, index);
        const themeIndex = floor === 0 && index === 0 ? 0 : (index * 7 + floor * 5 + random(roomThemes.length)) % roomThemes.length;
        const theme = roomThemes[themeIndex];
        const node = {
          id: roomId(floor, index),
          floor,
          index,
          col: index % config.cols,
          row: Math.floor(index / config.cols),
          position,
          theme,
          name: floor === 0 && index === 0 ? config.city ? 'Old City Gate' : 'Grand Entrance' : theme.name
        };
        this.nodes.set(node.id, node);
        const tileMat = mats.floor.get(theme.kind + theme.name);
        addBox(group, geometries.box, tileMat, new THREE.Vector3(position.x, y - 0.16, position.z), new THREE.Vector3(CELL, 0.32, CELL));

        const wallMaterial = mats.wall.get(theme.name);
        const topNeighbor = node.row > 0 ? roomId(floor, index - config.cols) : null;
        const rightNeighbor = node.col < config.cols - 1 ? roomId(floor, index + 1) : null;
        const bottomNeighbor = node.row < config.rows - 1 ? roomId(floor, index + config.cols) : null;
        const leftNeighbor = node.col > 0 ? roomId(floor, index - 1) : null;
        const hasConnection = (neighbor) => neighbor && this.hasEdge(node.id, neighbor);
        buildWallWithDoor(group, this.colliders, geometries.box, wallMaterial, position.x, y, position.z - CELL / 2, CELL, true, hasConnection(topNeighbor), floor);
        buildWallWithDoor(group, this.colliders, geometries.box, wallMaterial, position.x + CELL / 2, y, position.z, CELL, false, hasConnection(rightNeighbor), floor);
        if (!bottomNeighbor) buildWallWithDoor(group, this.colliders, geometries.box, wallMaterial, position.x, y, position.z + CELL / 2, CELL, true, false, floor);
        if (!leftNeighbor) buildWallWithDoor(group, this.colliders, geometries.box, wallMaterial, position.x - CELL / 2, y, position.z, CELL, false, false, floor);

        this.addTrim(node, theme);
        this.addCeilingLight(position, y, floor, index);
        this.addRoomDecor(position, y, theme, floor, index);
        buildFurniture(group, this.colliders, geometries, mats, theme, position, random);
        this.addCeiling(position, y, floor, theme, index);
        if (config.city) this.addCitySign(node);
      }
    }
  }

  addCeiling(position, y, floor, theme, index) {
    const ceiling = new THREE.Mesh(
      this.geometries.box,
      new THREE.MeshStandardMaterial({
        color: theme.wall,
        roughness: 0.98,
        side: THREE.DoubleSide
      })
    );
    ceiling.position.set(position.x, y + WALL_HEIGHT, position.z);
    ceiling.scale.set(CELL - 0.08, 0.14, CELL - 0.08);
    ceiling.visible = false;
    this.group.add(ceiling);
    this.ceilings.push({ mesh: ceiling, floor, roomId: roomId(floor, index) });
  }

  addTrim(node, theme) {
    const { position, floor } = node;
    const y = floor * FLOOR_HEIGHT;
    const trimMat = this.materials.trim.get(theme.name);
    const geometry = this.geometries.box;
    for (const { dx, dz, neighbor, horizontal } of [
      {
        dx: 0,
        dz: -CELL / 2,
        neighbor: node.row > 0 ? roomId(floor, node.index - this.config.cols) : null,
        horizontal: true
      },
      {
        dx: CELL / 2,
        dz: 0,
        neighbor: node.col < this.config.cols - 1 ? roomId(floor, node.index + 1) : null,
        horizontal: false
      }
    ]) {
      if (!neighbor || !this.hasEdge(node.id, neighbor)) continue;
      for (const side of [-1, 1]) {
        const postX = position.x + dx + (horizontal ? side * (DOOR_WIDTH / 2 + 0.07) : 0);
        const postZ = position.z + dz + (horizontal ? 0 : side * (DOOR_WIDTH / 2 + 0.07));
        addBox(
          this.group,
          geometry,
          trimMat,
          new THREE.Vector3(postX, y + WALL_HEIGHT / 2, postZ),
          new THREE.Vector3(WALL_THICKNESS + 0.05, WALL_HEIGHT, WALL_THICKNESS + 0.05)
        );
      }
      addBox(
        this.group,
        geometry,
        trimMat,
        new THREE.Vector3(position.x + dx, y + WALL_HEIGHT - 0.22, position.z + dz),
        new THREE.Vector3(
          horizontal ? DOOR_WIDTH + 0.18 : WALL_THICKNESS + 0.05,
          0.18,
          horizontal ? WALL_THICKNESS + 0.05 : DOOR_WIDTH + 0.18
        )
      );
    }
  }

  addCeilingLight(position, y, floor, index) {
    const fixture = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6),
      new THREE.MeshStandardMaterial({ color: '#ffdf9e', emissive: '#ffb84b', emissiveIntensity: 1.8 })
    );
    fixture.position.set(position.x, y + WALL_HEIGHT - 0.35, position.z);
    this.group.add(fixture);
    if ((index + floor) % 2 === 0 || index === 0) {
      const light = new THREE.PointLight(floor === 0 ? 0xffd9a0 : 0xc7d8ff, 1.35, 14, 2);
      light.position.set(position.x, y + WALL_HEIGHT - 0.75, position.z);
      this.group.add(light);
    }
  }

  addRoomDecor(position, y, theme, floor, index) {
    const artMat = new THREE.MeshStandardMaterial({
      color: index % 2 ? '#365460' : '#956448',
      roughness: 0.7,
      emissive: index % 2 ? '#112d38' : '#331a0d',
      emissiveIntensity: 0.3
    });
    for (const [dx, dz, horizontal] of [[0, -CELL / 2 + 0.18, true], [CELL / 2 - 0.18, 0, false]]) {
      const art = new THREE.Mesh(this.geometries.box, artMat);
      art.position.set(position.x + dx - (horizontal ? 0 : 0.1), y + 2.72, position.z + dz - (horizontal ? 0.1 : 0));
      art.scale.set(horizontal ? 1.15 : 0.12, 1.2, horizontal ? 0.12 : 1.15);
      art.castShadow = true;
      this.group.add(art);
      const frame = new THREE.Mesh(this.geometries.box, this.materials.gold);
      frame.position.set(position.x + dx + (horizontal ? 0 : 0.09), y + 2.72, position.z + dz + (horizontal ? 0.09 : 0));
      frame.scale.set(horizontal ? 1.36 : 0.2, 1.42, horizontal ? 0.2 : 1.36);
      this.group.add(frame);
    }
    if (index === 0 && floor === 0) {
      const door = new THREE.Mesh(this.geometries.box, this.materials.woodDark);
      door.position.set(position.x - CELL / 2 + 0.18, y + 1.7, position.z);
      door.scale.set(0.25, 3.4, 2.9);
      this.group.add(door);
    }
    if (theme.kind === 'observatory') {
      const star = new THREE.Mesh(
        new THREE.TorusGeometry(1.3, 0.035, 8, 30),
        this.materials.gold
      );
      star.position.set(position.x, y + 3.8, position.z);
      star.rotation.x = Math.PI / 2;
      this.group.add(star);
    }
  }

  addCitySign(node) {
    const { position, theme } = node;
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: theme.trim,
      emissive: theme.trim,
      emissiveIntensity: 0.28,
      roughness: 0.54
    });
    addBox(
      this.group,
      this.geometries.box,
      this.materials.citySign,
      new THREE.Vector3(position.x + 3.15, position.y + 3.1, position.z - CELL / 2 - 0.13),
      new THREE.Vector3(4.6, 1.05, 0.16)
    );
    addBox(
      this.group,
      this.geometries.box,
      panelMaterial,
      new THREE.Vector3(position.x + 3.15, position.y + 3.1, position.z - CELL / 2 - 0.23),
      new THREE.Vector3(4.25, 0.14, 0.04)
    );
    addBox(
      this.group,
      this.geometries.box,
      panelMaterial,
      new THREE.Vector3(position.x, position.y + 4.12, position.z - CELL / 2 - 0.56),
      new THREE.Vector3(3.1, 0.18, 1.1)
    );
  }

  buildCityEnvironment(width, depth, spacing) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 38, depth + 38),
      this.materials.cityGround
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.37;
    ground.receiveShadow = true;
    this.group.add(ground);

    const streetWidth = spacing - CELL;
    const roadDepth = depth + streetWidth;
    const roadWidth = width + streetWidth;
    const cityHalfWidth = roadWidth / 2 + 0.5;
    const cityHalfDepth = roadDepth / 2 + 0.5;
    const boundaryThickness = 1.2;
    this.colliders.push(
      { minX: -cityHalfWidth - boundaryThickness, maxX: -cityHalfWidth, minZ: -cityHalfDepth - 2, maxZ: cityHalfDepth + 2, floor: 0 },
      { minX: cityHalfWidth, maxX: cityHalfWidth + boundaryThickness, minZ: -cityHalfDepth - 2, maxZ: cityHalfDepth + 2, floor: 0 },
      { minX: -cityHalfWidth - 2, maxX: cityHalfWidth + 2, minZ: -cityHalfDepth - boundaryThickness, maxZ: -cityHalfDepth, floor: 0 },
      { minX: -cityHalfWidth - 2, maxX: cityHalfWidth + 2, minZ: cityHalfDepth, maxZ: cityHalfDepth + boundaryThickness, floor: 0 }
    );
    const roadPlane = new THREE.PlaneGeometry(1, 1);
    const placeSurface = (x, z, surfaceWidth, surfaceDepth, material, y) => {
      const surface = new THREE.Mesh(roadPlane, material);
      surface.rotation.x = -Math.PI / 2;
      surface.position.set(x, y, z);
      surface.scale.set(surfaceWidth, surfaceDepth, 1);
      surface.receiveShadow = true;
      this.group.add(surface);
      return surface;
    };

    for (let col = 0; col < this.config.cols - 1; col++) {
      const x = (col + 0.5 - (this.config.cols - 1) / 2) * spacing;
      placeSurface(x, 0, streetWidth, roadDepth, this.materials.asphalt, -0.12);
      for (const side of [-1, 1]) {
        placeSurface(x + side * (streetWidth / 2 - 0.42), 0, 0.56, roadDepth, this.materials.sidewalk, -0.015);
      }
    }
    for (let row = 0; row < this.config.rows - 1; row++) {
      const z = (row + 0.5 - (this.config.rows - 1) / 2) * spacing;
      placeSurface(0, z, roadWidth, streetWidth, this.materials.asphalt, -0.12);
      for (const side of [-1, 1]) {
        placeSurface(0, z + side * (streetWidth / 2 - 0.42), roadWidth, 0.56, this.materials.sidewalk, -0.015);
      }
      for (let col = 0; col < this.config.cols - 1; col++) {
        const crossingX = (col + 0.5 - (this.config.cols - 1) / 2) * spacing;
        for (let stripe = -2; stripe <= 2; stripe++) {
          placeSurface(crossingX + stripe * 0.34, z, 0.13, streetWidth - 0.55, this.materials.roadMark, -0.105);
        }
      }
    }

    const lampPositions = [];
    for (let col = 0; col < this.config.cols - 1; col++) {
      for (let row = 0; row < this.config.rows - 1; row++) {
        const x = (col + 0.5 - (this.config.cols - 1) / 2) * spacing;
        const z = (row + 0.5 - (this.config.rows - 1) / 2) * spacing;
        lampPositions.push([x + streetWidth / 2 - 0.35, z + streetWidth / 2 - 0.35]);
      }
    }
    for (const [x, z] of lampPositions) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.11, 4.2, 7),
        this.materials.woodDark
      );
      pole.position.set(x, 2.1, z);
      this.group.add(pole);
      const arm = new THREE.Mesh(
        this.geometries.box,
        this.materials.gold
      );
      arm.position.set(x - 0.28, 4.05, z);
      arm.scale.set(0.62, 0.08, 0.08);
      this.group.add(arm);
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 8, 6),
        new THREE.MeshStandardMaterial({ color: '#ffe1a2', emissive: '#ffc766', emissiveIntensity: 2.2 })
      );
      lamp.position.set(x - 0.48, 3.99, z);
      this.group.add(lamp);
      this.colliders.push({ minX: x - 0.18, maxX: x + 0.18, minZ: z - 0.18, maxZ: z + 0.18, floor: 0 });
      addPointLight(this.group, 0xffd293, 0.6, 9, new THREE.Vector3(x - 0.48, 3.7, z));
    }

    const skylineMaterials = [
      new THREE.MeshStandardMaterial({ color: '#68716e', roughness: 0.86 }),
      new THREE.MeshStandardMaterial({ color: '#77766d', roughness: 0.86 }),
      new THREE.MeshStandardMaterial({ color: '#586d72', roughness: 0.84 })
    ];
    for (let i = 0; i < 12; i++) {
      const x = (i % 4 - 1.5) * (width / 3.2);
      const z = (Math.floor(i / 4) - 1) * (depth / 1.65);
      if (Math.abs(x) < width / 2 + 5 && Math.abs(z) < depth / 2 + 5) continue;
      const height = 9 + this.random(16);
      const building = new THREE.Mesh(this.geometries.box, skylineMaterials[i % skylineMaterials.length]);
      building.position.set(x, height / 2 - 0.35, z);
      building.scale.set(7 + this.random(6), height, 7 + this.random(6));
      building.castShadow = true;
      this.group.add(building);
    }

  }

  buildStaircases() {
    if (this.config.floors < 2) return;
    for (let floor = 0; floor < this.config.floors; floor++) {
      const node = this.nodes.get(roomId(floor, 0));
      const x = node.position.x - 3.1;
      const z = node.position.z - 0.7;
      for (let step = 0; step < 7; step++) {
        addBox(
          this.group,
          this.geometries.box,
          this.materials.wood,
          new THREE.Vector3(x + step * 0.39, floor * FLOOR_HEIGHT + 0.16 + step * 0.24, z + step * 0.35),
          new THREE.Vector3(0.86, 0.32, 1.1)
        );
      }
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 3.5, 8),
        this.materials.gold
      );
      rail.position.set(x + 1.15, floor * FLOOR_HEIGHT + 1.1, z + 1.25);
      rail.rotation.z = -0.58;
      this.group.add(rail);
    }
  }

  buildLandmarks() {
    for (const node of this.nodes.values()) {
      if (node.index % 4 !== 2 && node.index !== this.nodes.size - 1) continue;
      if (node.id === this.targetId) continue;
      const landmarkIndex = (node.index + node.floor * 3) % landmarkNames.length;
      const base = node.position.clone();
      const marker = new THREE.Group();
      marker.position.set(base.x + 4.0, base.y, base.z + 3.8);
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.63, 0.42, 8),
        this.materials.gold
      );
      pedestal.position.y = 0.21;
      marker.add(pedestal);
      const icon = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.46, 1),
        new THREE.MeshStandardMaterial({
          color: landmarkIndex % 2 ? '#8ddbe0' : '#ffcf7a',
          metalness: 0.4,
          roughness: 0.22,
          emissive: landmarkIndex % 2 ? '#11606d' : '#69400f',
          emissiveIntensity: 0.55
        })
      );
      icon.position.y = 1.03;
      marker.add(icon);
      this.group.add(marker);
      this.colliders.push({ minX: marker.position.x - 0.65, maxX: marker.position.x + 0.65, minZ: marker.position.z - 0.65, maxZ: marker.position.z + 0.65, floor: node.floor });
      this.landmarks.push({
        name: landmarkNames[landmarkIndex],
        position: new THREE.Vector3(marker.position.x, base.y + 0.9, marker.position.z),
        floor: node.floor,
        nodeId: node.id
      });
    }
  }

  buildCollectibles() {
    const available = [...this.nodes.values()]
      .filter((node) => node.id !== '0:0' && node.id !== this.targetId);
    const items = [
      { type: 'compass', name: 'Compass charge', color: '#69ddff' },
      { type: 'time', name: 'Time bonus', color: '#ffd16d' },
      { type: 'compass', name: 'Compass charge', color: '#9c86ff' }
    ];
    this.collectibles = [];
    for (const item of items) {
      const index = this.random(available.length);
      const [node] = available.splice(index, 1);
      const group = new THREE.Group();
      const crystalMaterial = new THREE.MeshStandardMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 1.25,
        metalness: 0.28,
        roughness: 0.2
      });
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 1), crystalMaterial);
      crystal.position.y = 1.05;
      group.add(crystal);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.62, 0.045, 7, 20),
        new THREE.MeshBasicMaterial({ color: item.color })
      );
      ring.position.y = 1.05;
      ring.rotation.x = Math.PI / 2;
      group.add(ring);
      group.position.set(node.position.x, node.position.y + 0.08, node.position.z);
      group.userData.baseY = group.position.y;
      group.visible = false;
      group.name = item.name;
      this.group.add(group);
      const collectible = { ...item, nodeId: node.id, node, group, collected: false };
      this.collectibles.push(collectible);
      this.animatables.push(group);
    }
  }

  buildEnvironment() {
    const spacing = this.config.spacing || CELL;
    const width = this.config.cols * spacing;
    const depth = this.config.rows * spacing;
    if (this.config.city) {
      this.buildCityEnvironment(width, depth, spacing);
      return;
    }
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 36, depth + 36),
      new THREE.MeshStandardMaterial({ color: '#243629', roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -0.36, 0);
    ground.receiveShadow = true;
    this.group.add(ground);

    const grass = new THREE.MeshStandardMaterial({ color: '#38543a', roughness: 1 });
    for (let i = 0; i < this.config.cols + this.config.rows + 8; i++) {
      const tree = new THREE.Group();
      const x = (this.random(2) ? 1 : -1) * (width / 2 + 4 + this.random(8));
      const z = (this.random(2) ? 1 : -1) * (depth / 2 + 4 + this.random(8));
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 2.4, 7), this.materials.woodDark);
      trunk.position.y = 1.2;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8, 1), grass);
      crown.position.y = 3.0;
      crown.scale.set(1.1, 1.25, 1.1);
      tree.add(crown);
      tree.position.set(x, 0, z);
      this.group.add(tree);
    }

    const skyFill = new THREE.HemisphereLight(0xd1ddff, 0x524232, 1.2);
    this.scene.add(skyFill);
    this.externalLights = [skyFill];
  }

  chooseTarget() {
    const distances = this.distancesFrom('0:0');
    const candidates = [...distances.entries()]
      .filter(([id]) => id !== '0:0')
      .sort((a, b) => b[1] - a[1]);
    const difficultyRange = Math.max(1, Math.floor(candidates.length * (0.1 + this.levelIndex * 0.08)));
    return candidates[this.random(difficultyRange)][0];
  }

  distancesFrom(start) {
    const distances = new Map([[start, 0]]);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      for (const next of this.adjacency.get(current) || []) {
        if (distances.has(next)) continue;
        distances.set(next, distances.get(current) + 1);
        queue.push(next);
      }
    }
    return distances;
  }

  findPath(start, destination) {
    const previous = new Map([[start, null]]);
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      if (current === destination) break;
      for (const next of this.adjacency.get(current) || []) {
        if (previous.has(next)) continue;
        previous.set(next, current);
        queue.push(next);
      }
    }
    if (!previous.has(destination)) return null;
    const path = [];
    for (let current = destination; current !== null; current = previous.get(current)) path.unshift(current);
    return path;
  }

  createRoutePreview() {
    const points = this.route.map((id) => {
      const node = this.nodes.get(id);
      return new THREE.Vector3(node.position.x, node.position.y + 0.13, node.position.z);
    });
    for (let i = 0; i < points.length - 1; i++) {
      const segment = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.LineCurve3(points[i], points[i + 1]), 1, 0.075, 6, false),
        this.materials.route
      );
      segment.name = 'Memorize this route';
      this.group.add(segment);
      this.routeObjects.push(segment);
    }

    points.forEach((point, index) => {
      if (index === points.length - 1) return;
      const beacon = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12),
        this.materials.beacon
      );
      beacon.position.copy(point);
      beacon.position.y += 0.09;
      this.group.add(beacon);
      this.routeObjects.push(beacon);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.08, 9, 28),
      new THREE.MeshBasicMaterial({ color: 0xffd581, transparent: true, opacity: 0.94 })
    );
    ring.position.set(this.targetRoom.position.x, this.targetRoom.position.y + 0.15, this.targetRoom.position.z);
    ring.rotation.x = Math.PI / 2;
    this.group.add(ring);
    this.routeObjects.push(ring);
    const beaconLight = new THREE.PointLight(0xffc26b, 5, 20, 2);
    beaconLight.position.set(this.targetRoom.position.x, this.targetRoom.position.y + 3.5, this.targetRoom.position.z);
    this.group.add(beaconLight);
    this.routeObjects.push(beaconLight);
  }

  hasEdge(first, second) {
    return this.adjacency.get(first)?.includes(second) || false;
  }

  getStartPosition() {
    const entrance = this.nodes.get('0:0');
    return new THREE.Vector3(entrance.position.x + 1.8, entrance.position.y + PLAYER_HEIGHT, entrance.position.z + 1.8);
  }

  getOverviewBounds() {
    const spacing = this.config.spacing || CELL;
    return {
      center: new THREE.Vector3(0, ((this.config.floors - 1) * FLOOR_HEIGHT) / 2 + 1.7, 0),
      radius: Math.max(this.config.cols, this.config.rows) * spacing * 0.83 + this.config.floors * 3
    };
  }

  showRoute() {
    this.ceilings.forEach(({ mesh }) => { mesh.visible = false; });
    this.routeObjects.forEach((object) => { object.visible = true; });
    this.targetObject.visible = true;
  }

  hideRoute() {
    this.routeObjects.forEach((object) => { object.visible = false; });
    this.targetObject.visible = false;
  }

  setSearchVisibility(floor, position = null) {
    let cityBuilding = null;
    if (this.config.city && position) {
      const room = this.nodes.get(roomId(floor, this.roomAt(position)));
      const inside = Math.abs(position.x - room.position.x) < CELL / 2 - 0.45 &&
        Math.abs(position.z - room.position.z) < CELL / 2 - 0.45;
      if (inside) cityBuilding = room.id;
    }
    this.ceilings.forEach((ceiling) => {
      ceiling.mesh.visible = this.config.city
        ? Boolean(cityBuilding && ceiling.roomId === cityBuilding)
        : ceiling.floor === floor;
    });
  }

  revealNearbyTarget(playerPosition, floor) {
    const target = this.targetRoom.position;
    const distance = Math.hypot(target.x - playerPosition.x, target.z - playerPosition.z);
    this.targetObject.visible =
      floor === this.targetRoom.floor &&
      this.roomAt(playerPosition) === this.targetRoom.index &&
      distance < 5.2;
    return distance;
  }

  revealNearbyCollectibles(playerPosition, floor) {
    for (const item of this.collectibles) {
      const distance = Math.hypot(item.node.position.x - playerPosition.x, item.node.position.z - playerPosition.z);
      item.group.visible = !item.collected &&
        floor === item.node.floor &&
        this.roomAt(playerPosition) === item.node.index &&
        distance < 5.2;
    }
  }

  nearestStaircase(position, floor) {
    if (this.config.floors < 2) return null;
    const node = this.nodes.get(roomId(floor, 0));
    const distance = Math.hypot(node.position.x - position.x, node.position.z - position.z);
    return distance < 2.8 ? { distance, node } : null;
  }

  getStairFloor(floor, descend = false) {
    if (descend) return floor > 0 ? floor - 1 : null;
    return floor < this.config.floors - 1 ? floor + 1 : null;
  }

  useStaircase(nextFloor) {
    const node = this.nodes.get(roomId(nextFloor, 0));
    return new THREE.Vector3(node.position.x + 1.8, nextFloor * FLOOR_HEIGHT + PLAYER_HEIGHT, node.position.z + 1.8);
  }

  nearestLandmark(position, floor) {
    let nearest = null;
    for (const landmark of this.landmarks) {
      if (landmark.floor !== floor) continue;
      const distance = Math.hypot(landmark.position.x - position.x, landmark.position.z - position.z);
      if (!nearest || distance < nearest.distance) nearest = { ...landmark, distance };
    }
    return nearest;
  }

  hintDirection(currentPosition, currentFloor) {
    const currentIndex = this.roomAt(currentPosition);
    const currentId = roomId(currentFloor, currentIndex);
    const routeIndex = this.route.indexOf(currentId);
    const nextId = routeIndex >= 0 && routeIndex < this.route.length - 1
      ? this.route[routeIndex + 1]
      : this.findPath(currentId, this.targetId)?.[1];
    if (!nextId) return 'Find the staircase and check the next floor.';
    const next = this.nodes.get(nextId);
    if (next.floor !== currentFloor) return 'The route continues on another floor. Find the staircase in the entrance hall.';
    const dx = next.position.x - currentPosition.x;
    const dz = next.position.z - currentPosition.z;
    if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? 'Try the east doorway.' : 'Try the west doorway.';
    return dz > 0 ? 'Try the south doorway.' : 'Try the north doorway.';
  }

  roomAt(position) {
    const spacing = this.config.spacing || CELL;
    const col = THREE.MathUtils.clamp(Math.round(position.x / spacing + (this.config.cols - 1) / 2), 0, this.config.cols - 1);
    const row = THREE.MathUtils.clamp(Math.round(position.z / spacing + (this.config.rows - 1) / 2), 0, this.config.rows - 1);
    return row * this.config.cols + col;
  }

  update(time, playerPosition, floor, searching) {
    for (const object of this.animatables) {
      object.rotation.y = Math.sin(time * 0.6) * 0.16;
      if (object === this.targetObject) {
        object.position.y = this.targetRoom.position.y + 0.05 + Math.sin(time * 2.1) * 0.12;
      } else {
        object.position.y = object.userData.baseY + Math.sin(time * 2.1) * 0.1;
      }
    }
    if (searching) {
      this.revealNearbyTarget(playerPosition, floor);
      this.revealNearbyCollectibles(playerPosition, floor);
    }
  }

  interact(position, floor) {
    const item = this.collectibles.find((candidate) =>
      !candidate.collected &&
      candidate.node.floor === floor &&
      this.roomAt(position) === candidate.node.index &&
      Math.hypot(candidate.node.position.x - position.x, candidate.node.position.z - position.z) < 2.8
    );
    if (item) return { type: 'collectible', item };
    const distance = this.revealNearbyTarget(position, floor);
    if (floor === this.targetRoom.floor && this.roomAt(position) === this.targetRoom.index && distance < 3.4) {
      return { type: 'treasure', room: this.targetRoom };
    }
    const stairs = this.nearestStaircase(position, floor);
    if (stairs) return { type: 'stairs' };
    return null;
  }

  collectItem(item) {
    if (!this.collectibles.includes(item) || item.collected) return false;
    item.collected = true;
    item.group.visible = false;
    return true;
  }

  getInteractionPrompt(position, floor) {
    const item = this.collectibles.find((candidate) =>
      !candidate.collected &&
      candidate.node.floor === floor &&
      this.roomAt(position) === candidate.node.index &&
      Math.hypot(candidate.node.position.x - position.x, candidate.node.position.z - position.z) < 3.2
    );
    if (item) return { type: 'collectible', text: `Collect ${item.name} · E` };
    const distance = this.revealNearbyTarget(position, floor);
    if (floor === this.targetRoom.floor && this.roomAt(position) === this.targetRoom.index && distance < 3.8) {
      return { type: 'treasure', text: `Recover ${this.config.target}` };
    }
    const stairs = this.nearestStaircase(position, floor);
    if (stairs) {
      const canClimb = floor < this.config.floors - 1;
      const canDescend = floor > 0;
      const direction = canClimb && canDescend
        ? 'E: climb · Shift+E: descend'
        : canClimb
          ? 'Climb to the floor above · E'
          : 'Descend to the floor below · Shift+E';
      return { type: 'stairs', text: direction };
    }
    return null;
  }

  dispose() {
    this.group.removeFromParent();
    const geometries = new Set();
    const materials = new Set();
    this.group.traverse((object) => {
      if (object.geometry && !Object.values(this.geometries).includes(object.geometry)) geometries.add(object.geometry);
      if (object.material) {
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
        }
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    Object.values(this.geometries).forEach((geometry) => geometry.dispose());
    this.externalLights?.forEach((light) => this.scene.remove(light));
  }
}
