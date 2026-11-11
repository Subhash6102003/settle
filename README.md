# Settle — Conversational Billing & Proposal OS

> **Volopay Product & Tech Assignment**  
> *"Build a business that runs on Claude, with no AI inside it."*

---

## ⚡ Quick Start (1-Click Local Runner)

To start the entire application locally:
1. Double-click `run_all.bat` in this folder.
2. It launches:
   - **Backend API:** `http://localhost:5000`
   - **Frontend Studio & Dashboard:** `http://localhost:5173`
   - **Live Seed Proposal:** `http://localhost:5173/p/acme-brand-refresh-2026`

---

## 🤖 Connect to Claude Desktop (MCP Setup)

To connect Claude Desktop to Settle:

1. Open your Claude Desktop config file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add this snippet inside `mcpServers`:

```json
{
  "mcpServers": {
    "settle": {
      "command": "node",
      "args": [
        "D:\\don't_know\\settle\\mcp-server\\dist\\index.js"
      ],
      "env": {
        "SETTLE_API_URL": "http://localhost:5000"
      }
    }
  }
}
```

3. Restart Claude Desktop. You will see the hammer 🔨 icon with Settle's tools:
   - `add_client`
   - `create_proposal`
   - `create_invoice`
   - `get_status`
   - `send_reminder`

---

## 🌐 Cloud Deployment Architecture

### 1. Frontend on Vercel
1. Push `settle/frontend` to GitHub or import in Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL`: Your EC2 backend URL (`http://<EC2_PUBLIC_IP>:5000` or HTTPS domain)

### 2. Backend on AWS EC2
1. Launch an Ubuntu 24.04 `t2.micro` or `t3.micro` instance.
2. In Security Group, open inbound ports:
   - `22` (SSH)
   - `80` (HTTP)
   - `443` (HTTPS)
   - `5000` (Node API)
3. SSH into EC2 and run:
   ```bash
   git clone <repo>
   cd settle/backend
   npm install
   npm run build
   # Start with pm2
   npm install -g pm2
   pm2 start dist/server.js --name settle-api
   ```

### 3. Database (AWS RDS PostgreSQL)
- In AWS Console, create a PostgreSQL Free Tier DB (`settle-db`).
- Set `DATABASE_URL` in `backend/.env`:
  ```env
  DATABASE_URL=postgres://postgres:<PASSWORD>@<RDS_ENDPOINT>:5432/settle
  ```
- If RDS is not configured, Settle automatically uses its zero-latency persistent file store fallback!
