import assert from 'node:assert/strict';
import test from 'node:test';
import { Scene, Vector3 } from 'three';
import { CELL, FLOOR_HEIGHT, LEVELS, Mansion, PLAYER_HEIGHT } from '../src/mansion.js';
import { Player } from '../src/player.js';

function reachableRooms(mansion) {
  const reached = new Set(['0:0']);
  const pending = ['0:0'];
  while (pending.length) {
    const current = pending.shift();
    for (const neighbor of mansion.adjacency.get(current)) {
      if (reached.has(neighbor)) continue;
      reached.add(neighbor);
      pending.push(neighbor);
    }
  }
  return reached;
}

for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex++) {
  test(`${LEVELS[levelIndex].title}: generated routes and treasures are reachable`, () => {
    for (let seed = 1; seed <= 4; seed++) {
      const mansion = new Mansion(new Scene(), levelIndex, 7919 * seed + levelIndex);
      try {
        const roomCount = LEVELS[levelIndex].cols * LEVELS[levelIndex].rows * LEVELS[levelIndex].floors;
        assert.equal(mansion.nodes.size, roomCount);
        assert.equal(reachableRooms(mansion).size, roomCount, 'every room must connect to the entrance');
        assert.equal(mansion.route[0], '0:0');
        assert.equal(mansion.route.at(-1), mansion.targetId);
        assert.ok(mansion.route.every((room, index) =>
          index === 0 || mansion.hasEdge(mansion.route[index - 1], room)
        ), 'every route segment must use a real doorway or staircase');
        const collisionTester = Object.create(Player.prototype);
        collisionTester.colliders = mansion.colliders;
        for (const edge of mansion.edges.filter(({ type }) => type === 'door')) {
          const first = mansion.nodes.get(edge.from);
          const second = mansion.nodes.get(edge.to);
          const deltaX = second.position.x - first.position.x;
          const deltaZ = second.position.z - first.position.z;
          const directionX = Math.sign(deltaX);
          const directionZ = Math.sign(deltaZ);
          const crossing = new Vector3(
            first.position.x + directionX * CELL / 2,
            first.floor * FLOOR_HEIGHT + PLAYER_HEIGHT,
            first.position.z + directionZ * CELL / 2
          );
          collisionTester.floor = first.floor;
          collisionTester.camera = { position: crossing.clone() };
          assert.equal(
            collisionTester.collides(crossing.x, crossing.z),
            false,
            `doorway from ${edge.from} to ${edge.to} must have a clear collision opening`
          );
          const start = crossing.clone().add(new Vector3(-directionX * 0.7, 0, -directionZ * 0.7));
          collisionTester.camera.position.copy(start);
          collisionTester.move(directionX * 1.4, directionZ * 1.4);
          assert.ok(
            deltaX
              ? (collisionTester.camera.position.x - crossing.x) * directionX > 0
              : (collisionTester.camera.position.z - crossing.z) * directionZ > 0,
            `player movement must cross the doorway from ${edge.from} to ${edge.to}`
          );
        }
        assert.ok(mansion.getInteractionPrompt(mansion.targetRoom.position, mansion.targetRoom.floor)?.type === 'treasure');
        assert.equal(
          mansion.interact(mansion.targetRoom.position, mansion.targetRoom.floor)?.type,
          'treasure',
          'the treasure must be recoverable at its destination'
        );
        const otherRoom = [...mansion.nodes.values()].find((room) => room.id !== mansion.targetId);
        assert.notEqual(mansion.interact(otherRoom.position, otherRoom.floor)?.type, 'treasure');
        assert.equal(mansion.collectibles.length, 3);
        for (const item of mansion.collectibles) {
          assert.equal(mansion.interact(item.node.position, item.node.floor)?.type, 'collectible');
          assert.equal(mansion.getInteractionPrompt(item.node.position, item.node.floor)?.type, 'collectible');
          mansion.update(0, item.node.position, item.node.floor, true);
          assert.equal(item.group.visible, true, 'supplies should appear only when approached');
          assert.equal(mansion.collectItem(item), true);
          assert.equal(item.group.visible, false, 'collected supplies should disappear');
          assert.notEqual(mansion.interact(item.node.position, item.node.floor)?.type, 'collectible');
        }
        mansion.showRoute();
        assert.equal(mansion.targetObject.visible, true);
        mansion.hideRoute();
        assert.equal(mansion.targetObject.visible, false);
        assert.ok(mansion.routeObjects.every((object) => !object.visible), 'search mode must hide every guide marker');
        assert.equal(mansion.edges.filter((edge) => edge.type === 'stair').length, LEVELS[levelIndex].floors - 1);
        if (LEVELS[levelIndex].city) {
          const expectedStreetLinks =
            LEVELS[levelIndex].cols * (LEVELS[levelIndex].rows - 1) +
            LEVELS[levelIndex].rows * (LEVELS[levelIndex].cols - 1);
          assert.equal(mansion.edges.length, expectedStreetLinks, 'every neighboring city block must connect to the street grid');
          assert.equal(mansion.nodes.size, 49, 'the city district must have seven connected blocks in each direction');
          assert.ok(
            mansion.nodes.get('0:1').position.x - mansion.nodes.get('0:0').position.x > CELL,
            'city blocks must leave room for the streets between buildings'
          );
          for (const room of mansion.nodes.values()) {
            assert.equal(mansion.roomAt(room.position), room.index, 'city coordinates must resolve to the correct building');
          }
          assert.ok(
            mansion.getOverviewBounds().radius > Math.max(LEVELS[levelIndex].cols, LEVELS[levelIndex].rows) * CELL,
            'the overview camera must frame the full-width city'
          );
          const cityRoom = mansion.nodes.get('0:0');
          mansion.setSearchVisibility(0, cityRoom.position);
          assert.equal(mansion.ceilings.filter(({ mesh }) => mesh.visible).length, 1);
          const street = cityRoom.position.clone();
          street.x += LEVELS[levelIndex].spacing / 2;
          mansion.setSearchVisibility(0, street);
          assert.equal(mansion.ceilings.filter(({ mesh }) => mesh.visible).length, 0);
        }
        if (LEVELS[levelIndex].floors > 1) {
          const entrance = mansion.nodes.get('0:0').position.clone();
          entrance.x += 1.8;
          entrance.z += 1.8;
          assert.equal(mansion.interact(entrance, 0)?.type, 'stairs');
          assert.equal(mansion.getStairFloor(0), 1);
          assert.equal(mansion.getStairFloor(LEVELS[levelIndex].floors - 1, true), LEVELS[levelIndex].floors - 2);
        }
      } finally {
        mansion.dispose();
      }
    }
  });
}
