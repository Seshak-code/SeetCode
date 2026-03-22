import { createProblem } from '../services/databaseService.js';

// ─── Level 1: Robot Grid Tracker (Pathing Firmware) ──────────────────────────

const robotTrackerData = {
  "slug": "robot-grid-tracker",
  "title": "Robot Grid Tracker — Level 1: Firmware",
  "difficulty": "Easy",
  "summary": "Write AZ-100 pathing firmware using a pre-built Hardware Abstraction Layer (HAL) to navigate the robot to a target coordinate.",
  "description": `<h2>🔧 Welcome to the AZ-100 Hardware Integration Lab</h2>

You have been assigned to the firmware team for the <b>AZ-100 Warehouse Logistics Robot</b>. The platform team has already built and validated the <b>Hardware Abstraction Layer (HAL)</b> — it handles all motor bus signaling, odometry tracking, and safety fault detection.

<b>Your job is to write the Pathing Logic firmware</b> that drives the robot from its deployment origin to the mission target.

<h3>📦 Deployment Configuration</h3>
<ul>
  <li><b>Testing Floor:</b> 10 × 10 grid, coordinates <code>0–9</code></li>
  <li><b>Starting Pose:</b> <code>(x=0, y=0)</code>, heading: <b>North</b></li>
  <li><b>Mission Target:</b> Charging pad at <code>(7, 7)</code></li>
</ul>

<h3>🧩 How it Works</h3>
The robot's onboard CPU receives a <code>commandBuffer</code> string from the Mission Controller. You must iterate through each command and invoke the correct <b>HAL function</b> to actuate the hardware:

<ul>
  <li><code>'G'</code> — Call <code>HAL::drive()</code> to engage the drive motors</li>
  <li><code>'L'</code> — Call <code>HAL::rotate(-1)</code> to rotate CCW (port thruster)</li>
  <li><code>'R'</code> — Call <code>HAL::rotate(+1)</code> to rotate CW (starboard thruster)</li>
</ul>

You must also call <code>HAL::logPose()</code> after <b>every command</b> to record the telemetry state. The HAL automatically handles all boundary enforcement — a <code>drive()</code> command that would violate the grid edge will fault-stall harmlessly.

<h3>📡 Telemetry Monitor</h3>
The execution engine reads your telemetry log and renders the robot's path on the grid below in real-time.

<blockquote><b>📖 Reference:</b> Open the <b>Hardware Datasheet</b> tab for the full AZ-100 HAL API specification.</blockquote>`,
  "themes": ["Hardware Simulation", "Embedded Systems"],
  "topics": ["Simulation", "State Machine"],
  "hints": [
    "DOC-102A: Motor Drive Limits — HAL::drive() is safety-gated. If a 'G' command would push the unit beyond the 0–9 boundary, the motor bus issues a stall-fault and the pose register is NOT updated. Your firmware does not need to handle this — just call drive() unconditionally.",
    "DOC-104C: Gyroscopic Array Cycles — HAL::rotate() updates the internal heading register but does NOT update (x, y). It still consumes a clock cycle, so you must still call HAL::logPose() after every rotation command to keep the telemetry timeline accurate.",
    "DOC-110B: Pose Register Access — You may query the current pose at any time via HAL::posX(), HAL::posY(), and HAL::heading() if you need to build conditional logic (e.g., check if you've reached the target)."
  ],
  "constraints": [
    "Testing floor: 10×10 (coordinates 0–9).",
    "Mission target: (7, 7).",
    "commandBuffer[i] ∈ {'G', 'L', 'R'}"
  ],
  "examples": [
    {
      "input": "commandBuffer = \"GGGGGGGRGGGGGGG\"",
      "output": "Telemetry log: [[0,0,N],[0,1,N],...,[0,7,N],[0,7,E],[1,7,E],...,[7,7,E]]",
      "explanation": "Unit drives 7 steps North, rotates CW to East, drives 7 steps East — reaching (7,7)."
    }
  ],
  "starterCode": {
    "logic": {
      "cpp_firmware": `// ═══════════════════════════════════════════════════════════════════
//  AZ-100 Hardware Abstraction Layer (HAL)   —   Rev 2.1
//  Firmware Release: STABLE | Cleared for Integration
//  ⚠  DO NOT MODIFY — Hardware-baked firmware. Changes require
//     a full hardware validation cycle (HVC-4 clearance required).
// ═══════════════════════════════════════════════════════════════════
#pragma once
#include <vector>
#include <string>
using namespace std;

// ── Internal Pose Register (managed by HAL) ───────────────────────
namespace HAL_INTERNAL {
  static int  _x       = 0;
  static int  _y       = 0;
  static int  _heading = 0;   // 0=N  1=E  2=S  3=W
  static const int _DX[4] = {  0, 1,  0, -1 };
  static const int _DY[4] = {  1, 0, -1,  0 };
  static const string _DIR_LABEL[4] = { "N", "E", "S", "W" };

  struct PoseSnapshot { int x, y; string dir; };
  static vector<PoseSnapshot> _telemetry;
}

// ── Public HAL API ────────────────────────────────────────────────
namespace HAL {
  // Motor Bus — Drive
  //   Engages drive motors for a single coordinate step in the
  //   current heading direction.
  //   Safety Fault: If the target coordinate violates the 0–9
  //   boundary, a motor stall-fault is issued. Pose unchanged.
  inline void drive() {
    int tx = HAL_INTERNAL::_x + HAL_INTERNAL::_DX[HAL_INTERNAL::_heading];
    int ty = HAL_INTERNAL::_y + HAL_INTERNAL::_DY[HAL_INTERNAL::_heading];
    if (tx >= 0 && tx <= 9 && ty >= 0 && ty <= 9) {
      HAL_INTERNAL::_x = tx;
      HAL_INTERNAL::_y = ty;
    }
    // Boundary fault → stall, pose unchanged
  }

  // Gyroscopic Array — Rotate
  //   Rotates the chassis in-place.
  //   dir: +1 = CW (starboard), -1 = CCW (port)
  //   Heading: 0=N → 1=E → 2=S → 3=W → 0
  inline void rotate(int dir) {
    HAL_INTERNAL::_heading = (HAL_INTERNAL::_heading + dir + 4) % 4;
  }

  // Telemetry Logger
  //   Captures the current pose snapshot into the telemetry buffer.
  //   Must be called after every command cycle.
  inline void logPose() {
    HAL_INTERNAL::_telemetry.push_back({
      HAL_INTERNAL::_x,
      HAL_INTERNAL::_y,
      HAL_INTERNAL::_DIR_LABEL[HAL_INTERNAL::_heading]
    });
  }

  // Pose Register — Read-Only Accessors
  inline int    posX()    { return HAL_INTERNAL::_x; }
  inline int    posY()    { return HAL_INTERNAL::_y; }
  inline int    heading() { return HAL_INTERNAL::_heading; }
  inline string headingLabel() { return HAL_INTERNAL::_DIR_LABEL[HAL_INTERNAL::_heading]; }

  // Test Harness Access (used by main.cpp — do not call from firmware)
  inline vector<HAL_INTERNAL::PoseSnapshot>& _getTelemetry() {
    return HAL_INTERNAL::_telemetry;
  }
  inline void _resetState() {
    HAL_INTERNAL::_x = 0; HAL_INTERNAL::_y = 0;
    HAL_INTERNAL::_heading = 0;
    HAL_INTERNAL::_telemetry.clear();
  }
}`,
      "cpp": `// ═══════════════════════════════════════════════════════════════════
//  AZ-100 Pathing Firmware   —   Mission Controller v1.0
//  Your implementation goes here.
//  Use ONLY the HAL namespace API to control the robot.
//  Do NOT access raw coordinates — they are hardware-internal.
// ═══════════════════════════════════════════════════════════════════
#pragma once
#include "firmware.h"

class MissionController {
public:
  // executeMission — Pathing Logic Entry Point
  //
  // Receives the command buffer from the Mission Controller CPU
  // and actuates the AZ-100 hardware via the HAL API.
  //
  // @param commandBuffer  String of drive commands: 'G', 'L', 'R'
  //
  void executeMission(const string& commandBuffer) {
    HAL::logPose(); // Record initial deployment pose

    for (char cmd : commandBuffer) {
      if (cmd == 'G') {
        // TODO: Call HAL::drive() to advance one step
        
        HAL::logPose(); // Log pose after each command cycle
      } else if (cmd == 'L') {
        // TODO: Call HAL::rotate() with the correct direction
        
        HAL::logPose();
      } else if (cmd == 'R') {
        // TODO: Call HAL::rotate() with the correct direction
        
        HAL::logPose();
      }
    }
  }
};`
    },
    "graphics": `/**
 * renderGraphics — Level 1: Robot Pathing
 * (Managed by Platform Team — no changes needed)
 */
function renderGraphics(engine, rawOutput) {
  if (!rawOutput || !rawOutput.startsWith('GRID:')) return;

  const path = rawOutput.slice(5).split(';').map(s => {
    const [x, y, dir] = s.split(',');
    return { x: parseInt(x, 10), y: parseInt(y, 10), dir: dir.trim() };
  });

  if (!path.length) return;

  engine.setupGrid(10, 10);
  engine.drawTrail(path);
  engine.placeKite();
}`
  }
};

// ─── Test Wrappers ────────────────────────────────────────────────────────────
// main.cpp: includes firmware.h + solution.h, runs MissionController

const robotTrackerWrappers = {
  "cpp": `
#include <iostream>
#include <vector>
#include <string>
#include "firmware.h"
#include "solution.h"
using namespace std;

int main() {
    string testCmd = "GGGGGGGRGGGGGGG";  // 7 North, turn East, 7 East → (7,7)

    cout << "---TEST_RESULTS_START---" << endl;
    try {
        HAL::_resetState();
        MissionController mc;
        mc.executeMission(testCmd);

        auto& tele = HAL::_getTelemetry();
        string ps;
        bool inBounds = true;
        for (size_t k = 0; k < tele.size(); ++k) {
            ps += to_string(tele[k].x) + "," + to_string(tele[k].y) + "," + tele[k].dir;
            if (k < tele.size()-1) ps += ";";
            if (tele[k].x < 0 || tele[k].x > 9 || tele[k].y < 0 || tele[k].y > 9) inBounds = false;
        }

        auto last = tele.back();
        bool moved   = tele.size() > 1 && (last.x != 0 || last.y != 0);
        bool reached = last.x == 7 && last.y == 7;

        if (moved && inBounds && reached) {
            cout << "1|PASS|Mission Objective: Reach (7,7)<br>commandBuffer=\\\""
                 << testCmd << "\\\"|GRID:" << ps << "|[visual]" << endl;
            cout << "---TEST_RESULTS_END---" << endl;
            cout << "SUMMARY|1|1|0.001" << endl;
        } else {
            string msg = "Unit failed to reach target.";
            if (!moved)   msg = "Unit never actuated — HAL::drive() was never called!";
            else if (!inBounds) msg = "Telemetry log contains out-of-bounds coordinates!";
            else          msg = "Unit at (" + to_string(last.x) + "," + to_string(last.y) + ") — target is (7,7).";
            cout << "1|FAIL|Mission Objective: Reach (7,7)<br>commandBuffer=\\\""
                 << testCmd << "\\\"|ERROR:" << msg << "|GRID:" << ps << "|[error]" << endl;
            cout << "---TEST_RESULTS_END---" << endl;
            cout << "SUMMARY|0|1|0.001" << endl;
        }
    } catch (...) {
        cout << "1|FAIL|Execution Error|ERROR:Firmware threw an unhandled exception.|GRID:0,0,N|[error]" << endl;
        cout << "---TEST_RESULTS_END---" << endl;

        cout << "SUMMARY|0|1|0.001" << endl;
    }
    return 0;
}
`
};

async function seed() {
  console.log("Seeding Robot Grid Tracker (Level 1 — HAL Firmware)…");
  try {
    await createProblem(robotTrackerData, { test_wrappers: robotTrackerWrappers });
    console.log("Seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
