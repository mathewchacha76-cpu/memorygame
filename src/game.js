import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LEVELS, Mansion } from './mansion.js';
import { Player } from './player.js';
import { scoreRouteRecall } from './scoring.js';

const $ = (selector) => document.querySelector(selector);
const formatTime = (seconds) => {
  const wholeSeconds = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(wholeSeconds / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8b9eaa');
    this.scene.fog = new THREE.Fog('#8b9eaa', 80, 220);
    this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.08, 320);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = false;

    this.hemisphere = new THREE.HemisphereLight(0xe5e5ff, 0x534531, 1.45);
    this.scene.add(this.hemisphere);
    this.sun = new THREE.DirectionalLight(0xffe0b1, 2.2);
    this.sun.position.set(-28, 44, 24);
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.phase = 'menu';
    this.levelIndex = 0;
    this.mansion = null;
    this.orbit = null;
    this.player = null;
    this.briefingElapsed = 0;
    this.searchRemaining = 0;
    this.hintsRemaining = 0;
    this.hintsUsed = 0;
    this.seenLandmarks = new Set();
    this.lastLandmark = '';
    this.hintUntil = 0;
    this.successfulLevels = 0;
    this.collectiblesCollected = 0;
    this.routeGuess = [];
    this.routeMemoryBonus = 0;
    this.achievements = new Map();
    this.previousFrame = 0;
    this.frameId = 0;

    this.onResize = () => this.resize();
    this.onCanvasClick = () => {
      if (this.phase === 'search' && this.player && !this.player.isLocked) this.player.lock();
    };
    this.onStart = () => this.startCampaign();
    this.onEnter = () => this.beginSearch();
    this.onResume = () => this.resumeSearch();
    this.onContinue = () => this.continueCampaign();
    this.onHint = () => this.useHint();
    this.onRouteChallenge = () => this.toggleRouteChallenge();
    this.onRouteSubmit = () => this.submitRouteChallenge();
    this.onTouchPause = () => this.pauseSearch();
    this.onKey = (event) => {
      if (event.code === 'KeyH' && this.phase === 'search') {
        event.preventDefault();
        this.useHint();
      }
      if (event.code === 'Escape' && this.phase === 'search' && !this.player?.isLocked) {
        this.pauseSearch();
      }
    };

    this.renderer.domElement.addEventListener('click', this.onCanvasClick);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKey);
    $('#start-button').addEventListener('click', this.onStart);
    $('#enter-mansion-button').addEventListener('click', this.onEnter);
    $('#resume-button').addEventListener('click', this.onResume);
    $('#continue-button').addEventListener('click', this.onContinue);
    $('#hint-button').addEventListener('click', this.onHint);
    $('#route-challenge-button').addEventListener('click', this.onRouteChallenge);
    $('#route-submit-button').addEventListener('click', this.onRouteSubmit);
    $('#touch-pause').addEventListener('click', this.onTouchPause);
  }

  start() {
    this.loadMansion(0);
    this.setOverviewCamera();
    this.animate(0);
  }

  loadMansion(levelIndex) {
    if (this.mansion) this.mansion.dispose();
    this.levelIndex = levelIndex;
    this.mansion = new Mansion(this.scene, levelIndex);
    if (!this.player) {
      this.player = new Player(
        this.camera,
        this.canvas,
        (locked, fallback) => this.handlePointerLock(locked, fallback),
        (descend) => this.interact(descend)
      );
    }
    this.player.setWorld(this.mansion);
    this.player.visitedRooms.clear();
    this.seenLandmarks.clear();
    this.lastLandmark = '';
  }

  startCampaign() {
    this.successfulLevels = 0;
    $('#landing').classList.add('hidden');
    this.startLevel(0);
  }

  startLevel(levelIndex) {
    this.levelIndex = levelIndex;
    if (!this.mansion || this.mansion.levelIndex !== levelIndex) {
      this.loadMansion(levelIndex);
    }
    const config = LEVELS[levelIndex];
    this.phase = 'briefing';
    this.briefingElapsed = 0;
    this.searchRemaining = config.search;
    this.hintsRemaining = config.hints;
    this.hintsUsed = 0;
    this.collectiblesCollected = 0;
    this.routeGuess = [];
    this.routeMemoryBonus = 0;
    this.hintUntil = 0;
    this.player.visitedRooms.clear();
    this.seenLandmarks.clear();
    this.lastLandmark = '';
    this.mansion.showRoute();
    this.player.setPosition(this.mansion.getStartPosition(), 0);
    this.mansion.setSearchVisibility(0);
    this.player.setActive(false);
    $('#briefing').classList.remove('hidden');
    $('#briefing-title').textContent = this.mansion.targetRoom.name;
    $('#briefing-description').textContent =
      `${config.name} · ${config.cols * config.rows * config.floors} rooms across ${config.floors} ${config.floors === 1 ? 'floor' : 'floors'}. Rotate the cutaway and memorize the glowing route.`;
    $('#level-kicker').textContent = `LEVEL ${String(levelIndex + 1).padStart(2, '0')} · ${config.title.toUpperCase()}`;
    $('#target-name').textContent = config.target.toUpperCase();
    $('#briefing-clock').textContent = formatTime(config.briefing);
    $('#briefing-meter-fill').style.width = '100%';
    $('#enter-mansion-button').disabled = true;
    $('#enter-mansion-button').textContent = 'Memorize the route…';
    $('#hud-level').textContent = `LEVEL ${String(levelIndex + 1).padStart(2, '0')}`;
    $('#objective-hud').textContent = `Find ${config.target}`;
    $('#phase-label').textContent = 'ROUTE BRIEFING';
    $('#floor-readout').textContent = '01';
    $('#search-clock').textContent = formatTime(config.search);
    $('#hint-count').textContent = String(this.hintsRemaining);
    $('#collectible-readout').textContent = 'Supplies collected: 0';
    $('#hint-button').disabled = true;
    $('#hud-top').classList.remove('hidden');
    $('#map-legend').classList.remove('hidden');
    $('#search-hud').classList.add('hidden');
    $('#bottom-controls').classList.add('hidden');
    $('#touch-controls').classList.add('hidden');
    $('#interaction-prompt').classList.add('hidden');
    $('#route-challenge').classList.add('hidden');
    $('#route-challenge-button').classList.add('hidden');
    $('#achievement-list').classList.add('hidden');
    $('#pause-screen').classList.add('hidden');
    $('#result-screen').classList.add('hidden');
    this.setOverviewCamera();
  }

  setOverviewCamera() {
    if (this.orbit) this.orbit.dispose();
    this.orbit = new OrbitControls(this.camera, this.canvas);
    const bounds = this.mansion.getOverviewBounds();
    this.orbit.target.copy(bounds.center);
    this.camera.position.set(
      bounds.center.x + bounds.radius * 0.85,
      bounds.center.y + bounds.radius * 0.82,
      bounds.center.z + bounds.radius * 0.9
    );
    this.camera.lookAt(bounds.center);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.055;
    this.orbit.enablePan = true;
    this.orbit.minDistance = bounds.radius * 0.55;
    this.orbit.maxDistance = bounds.radius * 2.5;
    this.orbit.maxPolarAngle = Math.PI * 0.48;
    this.orbit.autoRotate = true;
    this.orbit.autoRotateSpeed = 0.23;
    this.orbit.update();
  }

  beginSearch() {
    if (this.phase !== 'briefing' || this.briefingElapsed < LEVELS[this.levelIndex].briefing) return;
    this.phase = 'search';
    this.searchRemaining = LEVELS[this.levelIndex].search;
    this.mansion.hideRoute();
    this.orbit?.dispose();
    this.orbit = null;
    this.player.setPosition(this.mansion.getStartPosition(), 0);
    this.player.setActive(true);
    $('#briefing').classList.add('hidden');
    $('#map-legend').classList.add('hidden');
    $('#search-hud').classList.remove('hidden');
    $('#bottom-controls').classList.remove('hidden');
    if (this.player.touchMode) $('#touch-controls').classList.remove('hidden');
    $('#phase-label').textContent = 'SEARCH FROM MEMORY';
    $('#search-clock').textContent = formatTime(this.searchRemaining);
    $('#hint-button').disabled = this.hintsRemaining <= 0;
    $('#pointer-status').textContent = 'Click the world to capture mouse';
    this.player.lock();
  }

  handlePointerLock(locked, fallback = false) {
    $('#pointer-status').textContent = locked
      ? fallback ? this.player?.touchMode ? 'Touch controls enabled' : 'Drag to look · Esc to pause' : 'Mouse captured · Esc to pause'
      : 'Click the world to capture mouse';
    if (this.phase === 'search' && !locked) this.pauseSearch();
  }

  pauseSearch() {
    if (this.phase !== 'search') return;
    this.phase = 'paused';
    this.player.setActive(false);
    $('#pause-screen').classList.remove('hidden');
    $('#touch-controls').classList.add('hidden');
  }

  resumeSearch() {
    if (this.phase !== 'paused') return;
    $('#pause-screen').classList.add('hidden');
    this.phase = 'search';
    this.player.setActive(true);
    if (this.player.touchMode) $('#touch-controls').classList.remove('hidden');
    this.player.lock();
  }

  useHint() {
    if (this.phase !== 'search' || this.hintsRemaining <= 0) return;
    this.hintsRemaining -= 1;
    this.hintsUsed += 1;
    this.hintUntil = performance.now() + 6500;
    $('#hint-count').textContent = String(this.hintsRemaining);
    $('#hint-button').disabled = this.hintsRemaining <= 0;
    this.showToast(`COMPASS: ${this.mansion.hintDirection(this.camera.position, this.player.floor)}`);
  }

  showToast(message) {
    const toast = $('#hint-toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(this.toastTimeout);
    this.toastTimeout = window.setTimeout(() => toast.classList.add('hidden'), 4200);
  }

  interact(descend = false) {
    if (this.phase !== 'search') return;
    const interaction = this.mansion.interact(this.camera.position, this.player.floor);
    if (!interaction) {
      this.showToast('Nothing to interact with here. Explore the nearby rooms.');
      return;
    }
    if (interaction.type === 'treasure') {
      this.completeLevel();
      return;
    }
    if (interaction.type === 'collectible') {
      const { item } = interaction;
      if (!this.mansion.collectItem(item)) {
        this.showToast('That supply has already been collected.');
        return;
      }
      this.collectiblesCollected += 1;
      if (item.type === 'compass') {
        this.hintsRemaining += 1;
        $('#hint-count').textContent = String(this.hintsRemaining);
        $('#hint-button').disabled = false;
        this.showToast('Memory crystal collected. One compass charge added.');
      } else {
        this.searchRemaining = Math.min(LEVELS[this.levelIndex].search + 30, this.searchRemaining + 30);
        this.showToast('Time crystal collected. Thirty seconds added.');
      }
      $('#collectible-readout').textContent = `Supplies collected: ${this.collectiblesCollected}`;
      return;
    }
    if (interaction.type === 'stairs') {
      const previousFloor = this.player.floor;
      const nextFloor = this.mansion.getStairFloor(previousFloor, descend);
      if (nextFloor === null) {
        this.showToast(descend ? 'You are already on the ground floor.' : 'You are already on the highest floor.');
        return;
      }
      this.camera.position.copy(this.mansion.useStaircase(nextFloor));
      this.player.setFloor(nextFloor);
      this.mansion.setSearchVisibility(nextFloor);
      $('#floor-readout').textContent = String(nextFloor + 1).padStart(2, '0');
      const direction = nextFloor > previousFloor ? 'Climbed to' : 'Descended to';
      this.showToast(`${direction} floor ${nextFloor + 1}.`);
    }
  }

  getScore() {
    const config = LEVELS[this.levelIndex];
    const timeBonus = Math.min(420, Math.round((this.searchRemaining / config.search) * 420));
    const explorationBonus = Math.min(240, this.player.visitedRooms.size * 22);
    const landmarkBonus = Math.min(160, this.seenLandmarks.size * 40);
    const hintPenalty = this.hintsUsed * 110;
    const collectibleBonus = this.collectiblesCollected * 100;
    const memoryBonus = this.routeMemoryBonus;
    const completionPoints = 1000;
    const rawScore = Math.max(500, completionPoints + timeBonus + explorationBonus + landmarkBonus + collectibleBonus + memoryBonus - hintPenalty);
    const stars = rawScore >= 1450 && this.hintsUsed === 0
      ? 3
      : rawScore >= 1125
        ? 2
        : 1;
    return {
      rawScore,
      stars,
      timeBonus,
      explorationBonus,
      landmarkBonus,
      hintPenalty,
      collectibleBonus,
      memoryBonus
    };
  }

  unlockAchievement(id, title) {
    if (this.achievements.has(id)) return;
    this.achievements.set(id, title);
    this.showToast(`ACHIEVEMENT UNLOCKED: ${title}`);
  }

  updateAchievements(score) {
    if (this.successfulLevels === 1) this.unlockAchievement('first-treasure', 'First Treasure');
    if (this.hintsUsed === 0) this.unlockAchievement('sharp-memory', 'Sharp Memory');
    if (this.searchRemaining >= LEVELS[this.levelIndex].search * 0.55) this.unlockAchievement('quick-find', 'Quick Find');
    if (score.routeAccuracy === 1) this.unlockAchievement('perfect-route', 'Perfect Route');
    if (this.levelIndex === LEVELS.length - 1) this.unlockAchievement('city-navigator', 'City Navigator');
  }

  renderAchievements() {
    const panel = $('#achievement-list');
    if (this.achievements.size === 0) {
      panel.classList.add('hidden');
      return;
    }
    panel.innerHTML = `<strong>CAMPAIGN ACHIEVEMENTS</strong>${[...this.achievements.values()].map((title) => `<div>✦ ${title}</div>`).join('')}`;
    panel.classList.remove('hidden');
  }

  refreshResultScore(score) {
    const rows = [
      ['SCORE', score.rawScore.toLocaleString()],
      ['TIME LEFT', formatTime(this.searchRemaining)],
      ['ROOMS EXPLORED', this.player.visitedRooms.size]
    ];
    if (this.collectiblesCollected) rows.push(['SUPPLIES', this.collectiblesCollected]);
    if (this.routeMemoryBonus) rows.push(['MEMORY BONUS', `+${this.routeMemoryBonus}`]);
    $('#result-stats').innerHTML = rows
      .map(([label, value]) => `<div class="result-stat"><strong>${value}</strong><span>${label}</span></div>`)
      .join('');
    $('#result-stars').textContent = '★'.repeat(score.stars) + '☆'.repeat(3 - score.stars);
    $('#score-breakdown-text').textContent =
      `Recovery +1,000 · Time +${score.timeBonus} · Exploration +${score.explorationBonus} · Landmarks +${score.landmarkBonus} · Supplies +${score.collectibleBonus} · Route recall +${score.memoryBonus} · Hints −${score.hintPenalty}. Stars: 1 for recovery, 2 at 1,125+, 3 at 1,450+ with no hints.`;
    $('#score-breakdown').open = false;
  }

  toggleRouteChallenge() {
    if (this.phase !== 'result' || this.routeMemoryBonus) return;
    const panel = $('#route-challenge');
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    if (!opening) return;
    if (!this.routeGuess.length) this.routeGuess.push('0:0');
    this.renderRouteChoices();
  }

  renderRouteChoices() {
    const container = $('#route-map-container');
    container.replaceChildren();
    const config = LEVELS[this.levelIndex];
    for (let floor = 0; floor < config.floors; floor++) {
      const section = document.createElement('section');
      section.className = 'route-floor';
      const heading = document.createElement('strong');
      heading.textContent = `FLOOR ${String(floor + 1).padStart(2, '0')}`;
      section.append(heading);
      const grid = document.createElement('div');
      grid.className = 'route-grid';
      grid.style.setProperty('--route-cols', String(config.cols));
      for (let index = 0; index < config.cols * config.rows; index++) {
        const id = `${floor}:${index}`;
        const node = this.mansion.nodes.get(id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'route-node';
        button.textContent = selected
          ? `${String(this.routeGuess.indexOf(id) + 1).padStart(2, '0')} · ${node.name}`
          : node.name;
        button.title = node.name;
        const selected = this.routeGuess.includes(id);
        const isTarget = id === this.mansion.targetId;
        const last = this.routeGuess.at(-1);
        const canSelect = !selected && last !== this.mansion.targetId && this.mansion.hasEdge(last, id);
        button.disabled = !canSelect;
        button.classList.toggle('is-selected', selected);
        button.classList.toggle('is-next', canSelect);
        button.classList.toggle('is-target', isTarget);
        button.addEventListener('click', () => {
          if (!canSelect || this.phase !== 'result') return;
          this.routeGuess.push(id);
          this.renderRouteChoices();
        });
        grid.append(button);
      }
      section.append(grid);
      container.append(section);
    }
    const done = this.routeGuess.at(-1) === this.mansion.targetId;
    $('#route-submit-button').disabled = !done;
    $('#route-challenge-status').textContent = done
      ? `Path complete: ${this.routeGuess.length - 1} connections. Submit to compare your remembered route.`
      : `Selected ${this.routeGuess.length} room${this.routeGuess.length === 1 ? '' : 's'}. Choose a highlighted neighboring room to continue.`;
  }

  submitRouteChallenge() {
    if (this.phase !== 'result' || this.routeGuess.at(-1) !== this.mansion.targetId) return;
    const expected = this.mansion.route;
    const { accuracy, bonus } = scoreRouteRecall(expected, this.routeGuess);
    this.routeMemoryBonus = bonus;
    $('#route-challenge-status').textContent =
      `Route recall: ${Math.round(accuracy * 100)}% accurate. +${this.routeMemoryBonus} memory points.`;
    $('#route-submit-button').disabled = true;
    $('#route-challenge-button').disabled = true;
    $('#route-challenge-button').textContent = `Route reconstructed · ${Math.round(accuracy * 100)}%`;
    let score = this.getScore();
    score.routeAccuracy = accuracy;
    if (accuracy >= 0.8) this.unlockAchievement('route-memory', 'Route Remembered');
    if (accuracy === 1) this.unlockAchievement('perfect-route', 'Perfect Route');
    this.refreshResultScore(score);
    $('#score-breakdown').classList.remove('hidden');
    this.renderAchievements();
  }

  completeLevel() {
    if (this.phase !== 'search') return;
    this.phase = 'result';
    this.player.setActive(false);
    this.player.unlock();
    $('#touch-controls').classList.add('hidden');
    this.successfulLevels = Math.max(this.successfulLevels, this.levelIndex + 1);
    const config = LEVELS[this.levelIndex];
    let score = this.getScore();
    score.routeAccuracy = 0;
    this.updateAchievements(score);
    $('#result-eyebrow').textContent = 'TREASURE RECOVERED';
    $('#result-title').textContent = 'A memory well kept.';
    $('#result-description').textContent = `You found ${config.target} in ${this.mansion.targetRoom.name}. Your route is yours to remember.`;
    this.refreshResultScore(score);
    $('#score-breakdown').classList.remove('hidden');
    $('#route-challenge-button').classList.remove('hidden');
    $('#route-challenge-button').disabled = false;
    $('#route-challenge-button').textContent = 'Reconstruct the route for a memory bonus';
    this.renderAchievements();
    $('#continue-button').textContent = this.levelIndex === LEVELS.length - 1
      ? 'Finish the expedition'
      : 'Continue to the next level';
    $('#result-screen').classList.remove('hidden');
  }

  failLevel() {
    if (this.phase !== 'search') return;
    this.phase = 'failed';
    this.player.setActive(false);
    this.player.unlock();
    $('#touch-controls').classList.add('hidden');
    $('#result-eyebrow').textContent = 'SEARCH TIME EXPIRED';
    $('#result-title').textContent = 'The treasure remains hidden.';
    $('#result-description').textContent = `The ${LEVELS[this.levelIndex].target} was in ${this.mansion.targetRoom.name}. Study the revealed route, then try this level again.`;
    $('#result-stats').innerHTML = [
      ['ROOMS EXPLORED', this.player.visitedRooms.size],
      ['LANDMARKS FOUND', this.seenLandmarks.size],
      ['HINTS USED', this.hintsUsed]
    ].map(([label, value]) => `<div class="result-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('#result-stars').textContent = '';
    $('#score-breakdown').classList.add('hidden');
    $('#route-challenge-button').classList.add('hidden');
    $('#route-challenge').classList.add('hidden');
    $('#achievement-list').classList.add('hidden');
    $('#continue-button').textContent = 'Retry this level';
    this.mansion.showRoute();
    $('#map-legend').classList.remove('hidden');
    $('#result-screen').classList.remove('hidden');
  }

  continueCampaign() {
    if (this.phase === 'failed') {
      this.startLevel(this.levelIndex);
      return;
    }
    if (this.phase !== 'result') return;
    if (this.levelIndex < LEVELS.length - 1) {
      this.startLevel(this.levelIndex + 1);
      return;
    }
    this.phase = 'finished';
    $('#result-eyebrow').textContent = 'MASTER EXPLORER';
    $('#result-title').textContent = 'The city holds no secrets.';
    $('#result-description').textContent = `You completed all five expeditions, including the streets of the Lost City, and recovered every treasure.`;
    $('#result-stats').innerHTML = [
      ['LEVELS', `${this.successfulLevels} / ${LEVELS.length}`],
      ['TREASURES', '5'],
      ['ADVENTURER', 'MASTER']
    ].map(([label, value]) => `<div class="result-stat"><strong>${value}</strong><span>${label}</span></div>`).join('');
    $('#result-stars').textContent = '✦ ✦ ✦';
    $('#continue-button').textContent = 'Play the mansion again';
    $('#continue-button').onclick = () => {
      $('#continue-button').onclick = null;
      this.phase = 'result';
      this.startLevel(0);
    };
  }

  updateBriefing(delta) {
    const config = LEVELS[this.levelIndex];
    this.briefingElapsed += delta;
    const remaining = Math.max(0, config.briefing - this.briefingElapsed);
    $('#briefing-clock').textContent = formatTime(remaining);
    $('#briefing-meter-fill').style.width = `${(remaining / config.briefing) * 100}%`;
    if (remaining === 0) {
      $('#enter-mansion-button').disabled = false;
      $('#enter-mansion-button').textContent = 'Enter the mansion';
    }
  }

  updateSearch(delta, time) {
    this.searchRemaining = Math.max(0, this.searchRemaining - delta);
    $('#search-clock').textContent = formatTime(this.searchRemaining);
    if (this.searchRemaining <= 0) {
      this.failLevel();
      return;
    }

    const movement = this.player.update(delta, this.mansion);
    this.mansion.setSearchVisibility(this.player.floor, this.camera.position);
    if (movement?.roomChanged) {
      const current = this.mansion.nodes.get(`${this.player.floor}:${movement.roomIndex}`);
      if (current && current.name) this.showToast(`Entered ${current.name}`);
    }

    const nearbyLandmark = this.mansion.nearestLandmark(this.camera.position, this.player.floor);
    $('#compass-needle').style.transform = `rotate(${this.camera.rotation.y}rad)`;
    if (nearbyLandmark && nearbyLandmark.distance < 4.4) {
      this.seenLandmarks.add(nearbyLandmark.name);
      this.lastLandmark = nearbyLandmark.name;
      $('#landmark-readout').textContent = `Landmark nearby: ${nearbyLandmark.name}`;
    } else if (this.lastLandmark) {
      $('#landmark-readout').textContent = `Last landmark: ${this.lastLandmark}`;
    } else {
      $('#landmark-readout').textContent = 'Find a landmark to orient yourself.';
    }

    const prompt = this.mansion.getInteractionPrompt(this.camera.position, this.player.floor);
    if (prompt) {
      $('#interaction-label').textContent = prompt.text;
      $('#interaction-prompt').classList.remove('hidden');
      $('#touch-interact').textContent = prompt.type === 'collectible' ? 'COLLECT' : prompt.type === 'treasure' ? 'RECOVER' : 'INTERACT';
      $('#touch-interact').disabled = false;
    } else {
      $('#interaction-prompt').classList.add('hidden');
      $('#touch-interact').textContent = 'INTERACT';
      $('#touch-interact').disabled = true;
    }

    if (this.hintUntil && performance.now() > this.hintUntil) {
      this.hintUntil = 0;
      $('#hint-toast').classList.add('hidden');
    }
  }

  animate(timestamp) {
    this.frameId = requestAnimationFrame((time) => this.animate(time));
    const delta = this.previousFrame ? Math.min((timestamp - this.previousFrame) / 1000, 0.05) : 0;
    this.previousFrame = timestamp;

    if (this.phase === 'briefing') this.updateBriefing(delta);
    if (this.phase === 'search') this.updateSearch(delta, timestamp);
    if (this.mansion) {
      this.mansion.update(timestamp / 1000, this.camera.position, this.player?.floor || 0, this.phase === 'search');
    }
    if (this.orbit) this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
    this.player?.destroy();
    this.orbit?.dispose();
    this.mansion?.dispose();
    this.renderer.dispose();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKey);
    this.renderer.domElement.removeEventListener('click', this.onCanvasClick);
    $('#touch-pause').removeEventListener('click', this.onTouchPause);
  }
}
