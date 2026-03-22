# 🚀 SeetCode: The Ultimate Sandbox for Aspiring Devs

Welcome to **SeetCode**, a LeetCode clone designed for me and my friends who want to master algorithms without dealing with paywalls. Built with a modern **JavaScript** stack, SeetCode focuses on expanding on LeetCode problems with more realistic hardware & robotics focus, with a similar UI.

## 🛠 SeetCode Architecture

- **Frontend:** **React** application featuring a modern layout and simple interface.
- **Sandboxing:** Secure code execution powered by **Docker**, ensuring your coding environment is isolated and consistent across languages.
- **Database:** Uses **SQLite** for data retrieval and storage.
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

- ✅ **Monaco Editor:** A VS Code-like editing experience with syntax highlighting.
- ✅ **Robot Grid Visualizations:** Real-time animation of robot firmware logic.
- ✅ **Hardware Firmware HAL:** A dual-tab C++ environment for embedded systems simulation.
- ✅ **LiDAR Integration:** Algorithmic sensor simulation for obstacle avoidance challenges.
- ✅ **Algorithmic Optimizer:** Built-in heuristics for time and space complexity analysis.
- ✅ **Automated Judging:** Secure Docker-powered pipeline for multi-language execution.


