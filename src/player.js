import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const PLAYER_RADIUS = 0.42;
const WALK_SPEED = 5.3;
const SPRINT_MULTIPLIER = 1.65;

export class Player {
  constructor(camera, canvas, onLockChange, onInteract) {
    this.camera = camera;
    this.canvas = canvas;
    this.onLockChange = onLockChange;
    this.onInteract = onInteract;
    this.floor = 0;
    this.colliders = [];
    this.keys = new Set();
    this.previousRoom = null;
    this.visitedRooms = new Set();
    this.active = false;
    this.fallbackActive = false;
    this.touchMode = navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth <= 700;
    this.dragging = false;
    this.lastPointer = null;
    this.lookPointers = new Map();
    this.controls = new PointerLockControls(camera, canvas);
    this.controls.pointerSpeed = 0.8;
    this.direction = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.onKeyDown = (event) => this.handleKeyDown(event);
    this.onKeyUp = (event) => this.keys.delete(event.code);
    this.onPointerDown = (event) => {
      if (!this.active || !this.fallbackActive) return;
      this.dragging = true;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };
    this.onPointerMove = (event) => {
      if (!this.dragging || !this.fallbackActive || !this.lastPointer) return;
      const deltaX = event.clientX - this.lastPointer.x;
      const deltaY = event.clientY - this.lastPointer.y;
      this.lastPointer = { x: event.clientX, y: event.clientY };
      camera.rotation.order = 'YXZ';
      camera.rotation.y -= deltaX * 0.0025;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - deltaY * 0.0025, -1.45, 1.45);
    };
    this.onPointerUp = () => {
      this.dragging = false;
      this.lastPointer = null;
    };
    this.onPointerCancel = () => {
      this.dragging = false;
      this.lastPointer = null;
    };
    this.touchKeyButtons = [...document.querySelectorAll('.touch-key[data-key]')];
    this.onTouchKeyDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      this.keys.add(event.currentTarget.dataset.key);
    };
    this.onTouchKeyUp = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.keys.delete(event.currentTarget.dataset.key);
    };
    this.touchLook = document.querySelector('#touch-look');
    this.onLookPointerDown = (event) => {
      if (!this.active || !this.touchMode) return;
      event.preventDefault();
      event.stopPropagation();
      this.touchLook.setPointerCapture(event.pointerId);
      this.lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    };
    this.onLookPointerMove = (event) => {
      const previous = this.lookPointers.get(event.pointerId);
      if (!previous) return;
      event.preventDefault();
      event.stopPropagation();
      this.lookPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.rotateLook(event.clientX - previous.x, event.clientY - previous.y, 0.004);
    };
    this.onLookPointerUp = (event) => {
      this.lookPointers.delete(event.pointerId);
    };
    this.onTouchInteract = () => {
      if (this.active && this.isLocked) this.onInteract(false);
    };
    this.onTouchDescend = () => {
      if (this.active && this.isLocked) this.onInteract(true);
    };
    this.touchSprint = document.querySelector('#touch-sprint');
    this.onSprintDown = (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      this.keys.add('ShiftLeft');
      this.touchSprint.setAttribute('aria-pressed', 'true');
    };
    this.onSprintUp = () => {
      this.keys.delete('ShiftLeft');
      this.touchSprint.setAttribute('aria-pressed', 'false');
    };
    this.onPointerLock = () => {
      const locked = this.canvas.ownerDocument.pointerLockElement === this.canvas;
      if (locked) {
        this.hasPointerLock = true;
      } else if (this.hasPointerLock) {
        this.hasPointerLock = false;
      } else {
        return;
      }
      this.onLockChange(locked);
    };
    this.onPointerLockError = () => {
      if (!this.active || this.controls.isLocked) return;
      console.warn('Pointer lock was denied; using drag-to-look controls instead.');
      this.fallbackActive = true;
      this.onLockChange(true, true);
    };
    this.controls.addEventListener('lock', this.onPointerLock);
    this.controls.addEventListener('unlock', this.onPointerLock);
    this.canvas.ownerDocument.addEventListener('pointerlockerror', this.onPointerLockError);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerCancel);
    this.touchKeyButtons.forEach((button) => {
      button.addEventListener('pointerdown', this.onTouchKeyDown);
      button.addEventListener('pointerup', this.onTouchKeyUp);
      button.addEventListener('pointercancel', this.onTouchKeyUp);
      button.addEventListener('lostpointercapture', this.onTouchKeyUp);
    });
    this.touchLook.addEventListener('pointerdown', this.onLookPointerDown);
    this.touchLook.addEventListener('pointermove', this.onLookPointerMove);
    this.touchLook.addEventListener('pointerup', this.onLookPointerUp);
    this.touchLook.addEventListener('pointercancel', this.onLookPointerUp);
    this.touchLook.addEventListener('lostpointercapture', this.onLookPointerUp);
    document.querySelector('#touch-interact').addEventListener('click', this.onTouchInteract);
    document.querySelector('#touch-descend').addEventListener('click', this.onTouchDescend);
    this.touchSprint.addEventListener('pointerdown', this.onSprintDown);
    this.touchSprint.addEventListener('pointerup', this.onSprintUp);
    this.touchSprint.addEventListener('pointercancel', this.onSprintUp);
    this.touchSprint.addEventListener('lostpointercapture', this.onSprintUp);
  }

  rotateLook(deltaX, deltaY, sensitivity) {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y -= deltaX * sensitivity;
    this.camera.rotation.x = THREE.MathUtils.clamp(
      this.camera.rotation.x - deltaY * sensitivity,
      -1.45,
      1.45
    );
  }

  handleKeyDown(event) {
    if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    if (event.code === 'Escape' && this.fallbackActive) {
      this.fallbackActive = false;
      this.dragging = false;
      this.onLockChange(false);
    }
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(event.code)) {
      this.keys.add(event.code);
    }
    if (event.code === 'KeyE' && !event.repeat && this.active && this.isLocked) {
      this.onInteract(event.shiftKey);
    }
  }

  setWorld(mansion) {
    this.colliders = mansion.colliders;
  }

  setPosition(position, floor) {
    this.camera.position.copy(position);
    this.floor = floor;
    this.previousRoom = null;
    this.camera.rotation.set(0, 0, 0);
  }

  lock() {
    if (this.touchMode) {
      this.onLockChange(true, true);
      return;
    }
    if (typeof this.canvas.requestPointerLock !== 'function') {
      this.fallbackActive = true;
      this.onLockChange(true);
      return;
    }
    this.controls.lock();
  }

  unlock() {
    if (this.fallbackActive) {
      this.fallbackActive = false;
      this.dragging = false;
      this.onLockChange(false);
      return;
    }
    if (this.controls.isLocked) this.controls.unlock();
  }

  get isLocked() {
    return this.controls.isLocked || this.fallbackActive || (this.touchMode && this.active);
  }

  setActive(active) {
    this.active = active;
    if (!active) {
      this.keys.clear();
      this.lookPointers.clear();
      this.touchSprint.setAttribute('aria-pressed', 'false');
    }
  }

  setFloor(floor) {
    this.floor = floor;
  }

  move(dx, dz) {
    const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.28));
    const stepX = dx / steps;
    const stepZ = dz / steps;
    for (let i = 0; i < steps; i++) {
      const nextX = this.camera.position.x + stepX;
      if (!this.collides(nextX, this.camera.position.z)) this.camera.position.x = nextX;
      const nextZ = this.camera.position.z + stepZ;
      if (!this.collides(this.camera.position.x, nextZ)) this.camera.position.z = nextZ;
    }
  }

  collides(x, z) {
    for (const collider of this.colliders) {
      if (collider.floor !== this.floor) continue;
      const playerTop = this.camera.position.y + 0.15;
      if (collider.minY !== undefined && playerTop < collider.minY) continue;
      const closestX = THREE.MathUtils.clamp(x, collider.minX, collider.maxX);
      const closestZ = THREE.MathUtils.clamp(z, collider.minZ, collider.maxZ);
      const dx = x - closestX;
      const dz = z - closestZ;
      if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
    }
    return false;
  }

  update(delta, mansion) {
    if (!this.active || !this.isLocked) return null;
    const sprinting = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speed = WALK_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1) * delta;
    const forwardInput = Number(this.keys.has('KeyW')) - Number(this.keys.has('KeyS'));
    const sideInput = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA'));

    if (forwardInput || sideInput) {
      this.controls.getDirection(this.direction);
      this.direction.y = 0;
      this.direction.normalize();
      this.right.set(-this.direction.z, 0, this.direction.x);
      this.velocity
        .copy(this.direction)
        .multiplyScalar(forwardInput)
        .addScaledVector(this.right, sideInput)
        .normalize()
        .multiplyScalar(speed);
      this.move(this.velocity.x, this.velocity.z);
    }

    const roomIndex = mansion.roomAt(this.camera.position);
    const currentRoom = `${this.floor}:${roomIndex}`;
    if (currentRoom !== this.previousRoom) {
      this.previousRoom = currentRoom;
      this.visitedRooms.add(currentRoom);
      return { roomChanged: true, roomIndex };
    }
    return null;
  }

  destroy() {
    this.unlock();
    this.controls.dispose();
    this.canvas.ownerDocument.removeEventListener('pointerlockerror', this.onPointerLockError);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointercancel', this.onPointerCancel);
    this.touchKeyButtons.forEach((button) => {
      button.removeEventListener('pointerdown', this.onTouchKeyDown);
      button.removeEventListener('pointerup', this.onTouchKeyUp);
      button.removeEventListener('pointercancel', this.onTouchKeyUp);
      button.removeEventListener('lostpointercapture', this.onTouchKeyUp);
    });
    this.touchLook.removeEventListener('pointerdown', this.onLookPointerDown);
    this.touchLook.removeEventListener('pointermove', this.onLookPointerMove);
    this.touchLook.removeEventListener('pointerup', this.onLookPointerUp);
    this.touchLook.removeEventListener('pointercancel', this.onLookPointerUp);
    this.touchLook.removeEventListener('lostpointercapture', this.onLookPointerUp);
    document.querySelector('#touch-interact').removeEventListener('click', this.onTouchInteract);
    document.querySelector('#touch-descend').removeEventListener('click', this.onTouchDescend);
    this.touchSprint.removeEventListener('pointerdown', this.onSprintDown);
    this.touchSprint.removeEventListener('pointerup', this.onSprintUp);
    this.touchSprint.removeEventListener('pointercancel', this.onSprintUp);
    this.touchSprint.removeEventListener('lostpointercapture', this.onSprintUp);
  }
}
