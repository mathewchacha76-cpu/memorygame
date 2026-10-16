# 3D Memory Maze: The Lost Treasure

A browser-based, first-person memory adventure. The mansion and its room layouts are generated locally; the game uses free procedural geometry rather than external 3D assets.

## Run the game

1. Open this folder in Visual Studio Code.
2. Open **Terminal → New Terminal**.
3. Run `npm install` once, then `npm run dev`.
4. Open the local address printed by Vite, usually `http://localhost:5173`.

Use the Vite server rather than opening `index.html` directly; the game imports Three.js modules that need to be served by a development server.

To create and preview a production build, run `npm run build` and `npm run preview`.
Run `npm test` to check maze connectivity, route validity, treasure and supply interactions, staircase links, city coverage, and route-recall scoring.

## Controls

- **W / A / S / D:** Walk
- **Mouse:** Look around (if pointer lock is unavailable, click-drag to look)
- **Shift:** Sprint
- **E:** Recover treasure, collect supplies, or climb stairs
- **Shift + E:** Descend stairs
- **H:** Spend a limited compass hint
- **Escape:** Pause and release the pointer

During the briefing, drag to rotate the open-roof 3D overview and use the scroll wheel to zoom. The route is removed before first-person search begins. Click the game world to recapture the mouse after resuming.

On phones and touch devices, use the on-screen direction pad to move, drag the right side of the screen to look, tap **Interact** to recover the treasure or climb, and use **Down** to descend. Hold **Sprint** to run and tap **Pause** to pause the search. A landscape screen is recommended for the 3D search.

To open the game on a phone using the same Wi-Fi as your computer, start Vite with `npm run dev -- --host 0.0.0.0`, find your computer's local IPv4 address, and open `http://<computer-ip>:5173` on the phone. Allow the connection through the computer's firewall if prompted. Alternatively, forward port 5173 in VS Code and open the forwarded address.

## Current game

The first four procedural mansion expeditions grow from 9 rooms on one floor to a 60-room palace across three floors. The final Master level is a connected 49-building city district with streets, crossings, landmarks, and enterable destinations.

During each search, collect glowing supplies for extra compass charges or up to 30 seconds of additional time. Recover the target with **E** after reaching its room; progression only unlocks after a successful recovery. After a successful level, optionally reconstruct the room-to-room route from memory for up to 500 bonus points. Results show a score breakdown: 1,000 recovery points, time (up to 420), exploration (up to 240), landmarks (up to 160), supplies (+100 each), route recall (up to 500), and hint use (−110 each). One star is awarded for recovery, two at 1,125 points, and three at 1,450 points with no hints. Campaign achievements include First Treasure, Sharp Memory, Quick Find, Route Remembered, Perfect Route, and City Navigator.

There are no paid assets or external runtime services.
