# 🚀 SeetCode: The Ultimate Sandbox for Aspiring Devs

Welcome to **SeetCode**, a sleek, high-performance LeetCode clone designed for developers who want to master algorithms without the clutter. Built with a modern **JavaScript** stack, SeetCode focuses on speed, reliability, and a premium user experience.

Whether you're practicing for interviews or building the next big thing, SeetCode provides a robust environment to write, test, and optimize your code.

## 🛠 The Engine Room

SeetCode isn't just a pretty face; it's powered by a sophisticated architecture:

- **Frontend:** A blazing-fast **React** application featuring a responsive layout and dynamic code editing.
- **Sandboxing:** Secure code execution powered by **Docker**, ensuring your environment is isolated and consistent across languages.
- **Database:** Lightweight and efficient **SQLite** for lightning-fast data retrieval and storage.
- **Graphics Engine:** Integrated **JavaScript Sandbox** for real-time problem visualizations (e.g., Robot Grid Tracker).

## 📁 Project Layout

```text
SeetCode/
├── client/      # The React frontend
├── scripts/     # Automation and deployment scripts
├── server/      # The Node.js Express API
├── shared/      # Unified constants and types
└── docker_tmp/  # Temporary sandbox execution room
```

## 🚀 Getting Started

### 1. Local Development
Install dependencies and start the dev environment:
```bash
npm install
npm run dev
```

### 2. Remote Deployment & Private Hosting
Host SeetCode on a private Mac and access it from anywhere via **Tailscale**.

1. **Connect:** Install Tailscale on the server and your local machine.
2. **Deploy:** Run the automated deployment script on the server:
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```
   *This script pulls latest code, builds the production bundle, and re-seeds the database.*
3. **Persistence:** Use **PM2** to keep the server online:
   ```bash
   npm install -g pm2
   pm2 start server/src/app.js --name "seetcode-server"
   ```

### 3. Exposing to Friends (Optional)
If you want friends to access your site without a VPN:
1. **Enable Funnel:** 
   ```bash
   tailscale funnel 5174
   ```
2. **Share the Link:** Tailscale will provide a public URL (e.g., `https://seetcode.tail123.ts.net`).
3. **Turn Off:** When finished, run `tailscale funnel 5174 --off`.

## ✨ Current Capabilities

- ✅ **Monaco Editor:** A premium, VS Code-like editing experience with syntax highlighting.
- ✅ **Robot Grid Visualizations:** Real-time animation of robot firmware logic.
- ✅ **Hardware Firmware HAL:** A dual-tab C++ environment for embedded systems simulation.
- ✅ **LiDAR Integration:** Algorithmic sensor simulation for obstacle avoidance challenges.
- ✅ **Algorithmic Optimizer:** Built-in heuristics for O(N) time and space complexity analysis.
- ✅ **Automated Judging:** Secure Docker-powered pipeline for multi-language execution.

---
*Built with ❤️ by developers, for developers.*

---
*Built with ❤️ by developers, for developers.*

