import { createProblem } from '../services/databaseService.js';

// ─── Level 2: Robot Grid Tracker with LiDAR ─────────────────────────────────

const robotObstaclesData = {
  "slug": "robot-grid-obstacles",
  "title": "Robot Grid Tracker — Level 2: LiDAR Integration",
  "difficulty": "Medium",
  "summary": "Extend AZ-100 pathing firmware to use the onboard LiDAR sensor for real-time obstacle detection and collision avoidance.",
  "description": `<h2>🔧 AZ-100 Hardware Integration Lab — LiDAR Module Activated</h2>

The <b>AZ-100 Rev 2.4</b> unit has shipped with a new hardware component: a <b>forward-facing LiDAR module</b>. The platform team has updated the HAL to expose the LiDAR API. The testing floor now includes physical barricades.

<h3>⚠️ Hardware Upgrade Delta</h3>
The HAL now includes two new sensor functions:
<ul>
  <li><code>HAL::scanForward()</code> — Returns <code>true</code> if a barricade is directly ahead of the current heading, <code>false</code> if the path is clear.</li>
  <li><code>HAL::scanDir(int heading)</code> — Returns <code>true</code> if there is a barricade in a given heading direction (0=N, 1=E, 2=S, 3=W).</li>
</ul>

<b>Important:</b> <code>HAL::drive()</code> is still safety-gated — it will stall on a boundary violation — but it will <b>NOT</b> stall on a barricade collision. The firmware is now responsible for checking the LiDAR before issuing a drive command.

<h3>📦 Deployment Configuration</h3>
<ul>
  <li><b>Testing Floor:</b> 10 × 10 grid, coordinates <code>0–9</code></li>
  <li><b>Starting Pose:</b> <code>(x=0, y=0)</code>, heading: <b>North</b></li>
  <li><b>Floor Map:</b> Provided as a <code>vector&lt;vector&lt;int&gt;&gt;</code> via <code>HAL::_loadFloorMap()</code> (called by test harness)</li>
</ul>

<h3>🛠 Firmware Requirements</h3>
Implement <code>executeMission(commandBuffer)</code> in <b>C++</b>. For each <code>'G'</code> command, you must <b>check <code>HAL::scanForward()</code></b> before calling <code>HAL::drive()</code>. If the scan detects a barricade, skip the drive command but still call <code>HAL::logPose()</code> to record the stall cycle. Rotate commands work as in Level 1.

<h3>📡 Telemetry Monitor</h3>
The execution engine renders your telemetry log on the grid, including all barricades, to visually validate your avoidance algorithm.

<blockquote><b>📖 Reference:</b> Open the <b>Hardware Datasheet</b> tab for the full LiDAR API specification.</blockquote>`,
  "themes": ["Hardware Simulation", "Embedded Systems", "Sensors"],
  "topics": ["Simulation", "State Machine", "Collision Avoidance"],
  "hints": [
    "DOC-201A: LiDAR Memory Map — The floor map is a 2D array loaded into HAL internal state via HAL::_loadFloorMap(). A value of -1 at floorMap[y][x] indicates a hard barricade. The HAL uses this to resolve HAL::scanForward() responses.",
    "DOC-205C: Collision Avoidance Protocol — For each 'G' command: first call HAL::scanForward(). If it returns true (obstacle detected), do NOT call HAL::drive() — instead just call HAL::logPose() to record the stall cycle. If scanForward() returns false (path clear), then call HAL::drive() followed by HAL::logPose() as normal.",
    "DOC-209F: Bounds Checking Priority — HAL::scanForward() internally checks bounds before querying the floor map, so calling it is always safe. It returns true on a boundary edge (treating boundaries as 'obstacles') to prevent drive() from stalling unexpectedly."
  ],
  "constraints": [
    "Grid is 10×10 (coordinates 0–9).",
    "floorMap[y][x] is 0 (clear) or -1 (barricade).",
    "1 ≤ commandBuffer.length ≤ 200",
    "commandBuffer[i] ∈ {'G', 'L', 'R'}"
  ],
  "examples": [
    {
      "input": "commandBuffer = \"GRG\", barricade at (1, 1)",
      "output": "Unit drives to (0,1), rotates East, scans forward — barricade detected at (1,1). Drive stalled. Stall cycle logged.",
      "explanation": "HAL::scanForward() signals a barricade — firmware correctly skips drive() and logs the stall cycle."
    }
  ],
  "starterCode": {
    "logic": {
      "cpp_firmware": `// ═══════════════════════════════════════════════════════════════════
//  AZ-100 Hardware Abstraction Layer (HAL)   —   Rev 2.4
//  Firmware Release: STABLE | LiDAR Module Active
//  ⚠  DO NOT MODIFY — Hardware-baked firmware.
// ═══════════════════════════════════════════════════════════════════
#pragma once
#include <vector>
#include <string>
using namespace std;

// ── Internal Pose & Floor Map Register ───────────────────────────
namespace HAL_INTERNAL {
  static int  _x       = 0;
  static int  _y       = 0;
  static int  _heading = 0;   // 0=N  1=E  2=S  3=W
  static const int _DX[4] = {  0, 1,  0, -1 };
  static const int _DY[4] = {  1, 0, -1,  0 };
  static const string _DIR_LABEL[4] = { "N", "E", "S", "W" };
  static vector<vector<int>> _floorMap;   // Loaded by test harness

  struct PoseSnapshot { int x, y; string dir; };
  static vector<PoseSnapshot> _telemetry;
}

// ── Public HAL API ────────────────────────────────────────────────
namespace HAL {
  // Motor Bus — Drive
  //   Engages drive motors for a single coordinate step.
  //   Safety Fault: Stalls on boundary violation.
  //   ⚠  Does NOT stall on barricades — check LiDAR first!
  inline void drive() {
    int tx = HAL_INTERNAL::_x + HAL_INTERNAL::_DX[HAL_INTERNAL::_heading];
    int ty = HAL_INTERNAL::_y + HAL_INTERNAL::_DY[HAL_INTERNAL::_heading];
    if (tx >= 0 && tx <= 9 && ty >= 0 && ty <= 9) {
      HAL_INTERNAL::_x = tx;
      HAL_INTERNAL::_y = ty;
    }
  }

  // Gyroscopic Array — Rotate
  //   dir: +1 = CW (starboard), -1 = CCW (port)
  inline void rotate(int dir) {
    HAL_INTERNAL::_heading = (HAL_INTERNAL::_heading + dir + 4) % 4;
  }

  // Telemetry Logger — Log current pose snapshot
  inline void logPose() {
    HAL_INTERNAL::_telemetry.push_back({
      HAL_INTERNAL::_x,
      HAL_INTERNAL::_y,
      HAL_INTERNAL::_DIR_LABEL[HAL_INTERNAL::_heading]
    });
  }

  // ── LiDAR Sensor Module ───────────────────────────────────────
  // scanForward() — Active LiDAR forward scan
  //   Returns true  if a barricade OR boundary is directly ahead.
  //   Returns false if the path is clear.
  inline bool scanForward() {
    int tx = HAL_INTERNAL::_x + HAL_INTERNAL::_DX[HAL_INTERNAL::_heading];
    int ty = HAL_INTERNAL::_y + HAL_INTERNAL::_DY[HAL_INTERNAL::_heading];
    if (tx < 0 || tx > 9 || ty < 0 || ty > 9) return true;  // boundary = blocked
    return HAL_INTERNAL::_floorMap[ty][tx] == -1;
  }

  // scanDir(heading) — Directional LiDAR scan
  //   heading: 0=N, 1=E, 2=S, 3=W
  //   Returns true if a barricade or boundary is in that direction.
  inline bool scanDir(int h) {
    int tx = HAL_INTERNAL::_x + HAL_INTERNAL::_DX[h];
    int ty = HAL_INTERNAL::_y + HAL_INTERNAL::_DY[h];
    if (tx < 0 || tx > 9 || ty < 0 || ty > 9) return true;
    return HAL_INTERNAL::_floorMap[ty][tx] == -1;
  }

  // Pose Register — Read-Only Accessors
  inline int    posX()    { return HAL_INTERNAL::_x; }
  inline int    posY()    { return HAL_INTERNAL::_y; }
  inline int    heading() { return HAL_INTERNAL::_heading; }
  inline string headingLabel() { return HAL_INTERNAL::_DIR_LABEL[HAL_INTERNAL::_heading]; }

  // Test Harness Access (used by main.cpp — do not call)
  inline vector<HAL_INTERNAL::PoseSnapshot>& _getTelemetry() {
    return HAL_INTERNAL::_telemetry;
  }
  inline void _loadFloorMap(const vector<vector<int>>& map) {
    HAL_INTERNAL::_floorMap = map;
  }
  inline void _resetState() {
    HAL_INTERNAL::_x = 0; HAL_INTERNAL::_y = 0;
    HAL_INTERNAL::_heading = 0;
    HAL_INTERNAL::_telemetry.clear();
  }
}`,
      "cpp": `// ═══════════════════════════════════════════════════════════════════
//  AZ-100 Pathing Firmware   —   Mission Controller v2.0 (LiDAR)
//  Your implementation goes here.
//  Use ONLY the HAL namespace API.
//  New in v2.0: HAL::scanForward() and HAL::scanDir(heading)
// ═══════════════════════════════════════════════════════════════════
#pragma once
#include "firmware.h"

class MissionController {
public:
  // executeMission — Pathing Logic Entry Point (LiDAR-aware)
  //
  // @param commandBuffer  String of drive commands: 'G', 'L', 'R'
  //
  void executeMission(const string& commandBuffer) {
    HAL::logPose(); // Record initial deployment pose

    for (char cmd : commandBuffer) {
      if (cmd == 'G') {
        // TODO: Check HAL::scanForward() before driving
        //   If obstacle detected → log stall cycle only
        //   If path clear       → drive, then log
        
        HAL::logPose();
      } else if (cmd == 'L') {
        HAL::rotate(-1);
        HAL::logPose();
      } else if (cmd == 'R') {
        HAL::rotate(+1);
        HAL::logPose();
      }
    }
  }
};`
    },
    "graphics": `/**
 * renderGraphics — Level 2: LiDAR + Obstacles
 * (Managed by Platform Team — no changes needed)
 */
function renderGraphics(engine, rawOutput) {
  if (!rawOutput || !rawOutput.startsWith('GRID:')) return;

  const [gridPart, wallsPart] = rawOutput.slice(5).split(';WALLS:');

  const path = gridPart.split(';').map(s => {
    const [x, y, dir] = s.split(',');
    return { x: parseInt(x, 10), y: parseInt(y, 10), dir: dir?.trim() };
  });

  const walls = (wallsPart || '').split(';').filter(Boolean).map(s => {
    const [x, y] = s.split(',');
    return { x: parseInt(x), y: parseInt(y) };
  });

  engine.setWalls(walls);
  engine.setupGrid(10, 10);
  engine.drawTrail(path);
  engine.placeKite();
}`
  }
};

// ─── Test Wrappers ────────────────────────────────────────────────────────────
const walls     = [[2,1],[2,2],[2,3],[5,5],[5,6],[3,7],[7,2],[7,3]];
const wallsStr  = walls.map(([x,y]) => `${x},${y}`).join(';');

const buildGrid = () => {
  const g = Array.from({ length: 10 }, () => Array(10).fill(0));
  walls.forEach(([x,y]) => { if (y>=0&&y<10&&x>=0&&x<10) g[y][x] = -1; });
  return g;
};
const cppGrid = buildGrid().map(row => '{' + row.join(',') + '}').join(',');

const robotObstacleWrappers = {
  "cpp": `
#include <iostream>
#include <vector>
#include <string>
#include "firmware.h"
#include "solution.h"
using namespace std;

// ─── AZ-100 LiDAR Test Suite ─────────────────────────────────────────────────
//
// Floor map walls (x, y): (2,1) (2,2) (2,3) (5,5) (5,6) (3,7) (7,2) (7,3)
//
// Tests are designed so that WITHOUT LiDAR, the robot enters a wall cell.
// WITH proper HAL::scanForward() checks, the robot stalls correctly.
//
struct Test {
    string cmd;
    string name;
    int    expectX, expectY;   // Required final position (with correct LiDAR)
    string expectDir;
};

int main() {
    vector<vector<int>> grid = {${cppGrid}};

    vector<Test> tests = {
        // ── T1: Wall cluster at x=2 (y=1,2,3) approached from West ────────────
        // Path: (0,0)N → GG → (0,2)N → R → (0,2)E → GG → stall before (2,2)
        // Without LiDAR: enters (2,2) → collision. With LiDAR: stops at (1,2).
        { "GGRGG",       "T1: Wall Approach — Column x=2",      1, 2, "E" },

        // ── T2: Wall at (2,1) approached directly from South ─────────────────
        // Path: (0,0)N → R → (0,0)E → G → (1,0)E → L → (1,0)N → G → (1,1)N → R → (1,1)E → G → stall before (2,1)
        // Without LiDAR: enters (2,1) → collision. With LiDAR: stops at (1,1).
        { "RGLGRGGG",    "T2: LiDAR Stall — Barricade at (2,1)", 1, 1, "E" },

        // ── T3: Clear path north — no obstacles in column x=0 up to y=6 ──────
        // Path: (0,0)N → 6 steps → (0,6)N. No walls in this column segment.
        // Tests: basic drive works without spurious stalls. 
        { "GGGGGG",      "T3: Free Path — Clear North Run",      0, 6, "N" },

        // ── T4: LiDAR Stall — high wall cluster at (5,5) and (5,6) ──────────
        // Path: (0,0)N → R → (0,0)E → GGGGG → (5,0)E → L → (5,0)N → GGGGG → stall before (5,5)
        // Without LiDAR: enters (5,5) → collision. With LiDAR: stops at (5,4).
        { "RGGGGGLGGGGG", "T4: LiDAR Stall — Barricade at (5,5)", 5, 4, "N" },

        // ── T5: Wall at (7,2) and (7,3) approaching from West ─────────────────
        // Path: (0,0)N → RR → (0,0)S → boundary stall (y=-1) → L → E → GGGGGGG → (7,0)E → L → (7,0)N → GG → stall before (7,2)
        // Actually simpler: (0,0)N → RGGGGGGGLGG → (7,0)E → L=N → GG → stall before (7,2) ← at (7,1)
        { "RGGGGGGGLGG",  "T5: LiDAR Stall — Barricade at (7,2)", 7, 1, "N" },
    };

    cout << "---TEST_RESULTS_START---" << endl;
    int passed = 0;

    for (int i = 0; i < (int)tests.size(); i++) {
        HAL::_resetState();
        HAL::_loadFloorMap(grid);

        MissionController mc;
        mc.executeMission(tests[i].cmd);

        auto& tele = HAL::_getTelemetry();
        string ps;
        bool inBounds    = true;
        bool noCollision = true;

        for (size_t k = 0; k < tele.size(); k++) {
            ps += to_string(tele[k].x)+","+to_string(tele[k].y)+","+tele[k].dir;
            if (k < tele.size()-1) ps += ";";
            if (tele[k].x<0||tele[k].x>9||tele[k].y<0||tele[k].y>9) inBounds = false;
            if (grid[tele[k].y][tele[k].x] == -1)                     noCollision = false;
        }

        auto& last = tele.back();
        bool rightPos = (last.x == tests[i].expectX && last.y == tests[i].expectY);
        bool pass = inBounds && noCollision && rightPos;

        string detail = "cmd=\\\"" + tests[i].cmd + "\\\"<br>expected final=(" +
                        to_string(tests[i].expectX)+","+to_string(tests[i].expectY)+
                        ") got=("+to_string(last.x)+","+to_string(last.y)+")";

        if (pass) {
            cout << i+1 << "|PASS|" << tests[i].name << "<br>" << detail
                 << "|GRID:" << ps << ";WALLS:${wallsStr}|[visual]" << endl;
            passed++;
        } else {
            string reason = !inBounds    ? "Telemetry contains out-of-bounds coords!" :
                            !noCollision ? "COLLISION: Unit entered a barricade cell! Check HAL::scanForward() before HAL::drive()." :
                                          "Wrong final position — LiDAR stall logic may be triggering incorrectly.";
            cout << i+1 << "|FAIL|" << tests[i].name << "<br>" << detail
                 << "|ERROR:" << reason << "|GRID:" << ps << ";WALLS:${wallsStr}|[error]" << endl;
        }
    }

    cout << "---TEST_RESULTS_END---" << endl;
    cout << "SUMMARY|" << passed << "|" << tests.size() << "|0.001" << endl;
    return 0;
}
`
};


async function seed() {
  console.log("Seeding Robot Grid Tracker (Level 2 — LiDAR Firmware)…");
  try {
    await createProblem(robotObstaclesData, { test_wrappers: robotObstacleWrappers });
    console.log("Level 2 seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Level 2 seeding failed:", err);
    process.exit(1);
  }
}

seed();
