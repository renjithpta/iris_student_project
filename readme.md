Below is a **professionally structured and beginner-friendly `README.md`**.
It explains each step clearly so **even someone new to Hyperledger Fabric can follow it easily**.

---

# 🚀 Digital Election System

### Hyperledger Fabric 2.5 + React Portal Setup Guide

This guide explains **how to set up and run the project from scratch** on **Ubuntu 24.x**.

Even if you are new to Hyperledger Fabric, you can follow the steps one by one and run the system successfully.

---

# 📋 System Requirements

Before starting, make sure your system has the following:Make sure system has good enough config RAM(8 GB , 2 core.150 GB Storage.

| Requirement        | Version                       |
| ------------------ | ----------------------------- |
| OS                 | Ubuntu **24.x** (Recommended) |
| Node.js            | **v22.21.1**                  |
| Docker             | Installed                     |
| Docker Compose     | Installed                     |
| Hyperledger Fabric | **2.5 LTS**                   |

---

# ⚙️ Step 1 — Setup Hyperledger Fabric Environment

First you need to install **Hyperledger Fabric 2.5** on your machine.

Follow this detailed guide:

👉 [https://medium.com/@hemachandraMS/setup-hyperledger-fabric-2-5-lts-on-ubuntu-22-04-linux-f60163281f0c](https://medium.com/@hemachandraMS/setup-hyperledger-fabric-2-5-lts-on-ubuntu-22-04-linux-f60163281f0c)

This guide will help you install:

* Fabric binaries
* Docker images
* Fabric samples
* Fabric CA

---

# ⚙️ Step 2 — Add Fabric `bin` to PATH

After installing Fabric, you must add the **fabric-samples bin folder** to your system PATH.

This allows commands like `peer` to work from anywhere.

### Example

If your Fabric samples are located at:

```
~/fabric-samples/bin
```

Add it to PATH:

```bash
export PATH=$PATH:~/fabric-samples/bin
```

To make it permanent:

```bash
echo 'export PATH=$PATH:~/fabric-samples/bin' >> ~/.bashrc
source ~/.bashrc
```

---

# ✔️ Step 3 — Verify Installation

Check if Fabric peer CLI is working.

```bash
peer -v
```

You should see something similar to:

```
peer:
 Version: 2.5.x
```

Also verify Docker is installed:

```bash
docker -v
```

and

```bash
docker compose version
```

---

# ⚙️ Step 4 — Install Node.js

The project requires **Node.js version 22.21.1**.

Check your version:

```bash
node -v
```

If the version is different, install the required version using **NVM**.

Example:

```bash
nvm install 22.21.1
nvm use 22.21.1
```

---

# 📥 Step 5 — Clone the Repository

Clone the project repository:

```bash
git clone <repository-url>
```

Go into the project directory:

```bash
cd <project-folder>
```

---

# 🔑 Step 6 — Give Execution Permissions

Make sure all scripts have execution permissions.

Run:

```bash
sudo chmod -R +rwx .
```

This ensures scripts like **start.sh** and **stop.sh** can run correctly.

---

# 🛑 Step 7 — Stop Existing Network (If Running)

Before starting a new network, stop any running network.

Run:

```bash
./stop.sh
```

Wait until the script finishes completely.

---

# 📦 Step 8 — Install PM2

The project uses **PM2** to manage background processes.

Install it globally:

```bash
npm install -g pm2
```

Verify installation:

```bash
pm2 -v
```

---

# ▶️ Step 9 — Start the Network

Start the Fabric network and backend services.

Run:

```bash
./start.sh
```

This script will:

* Start Fabric network
* Deploy chaincode
* Start backend services

---

# 🌐 Step 10 — Start the Portal

Open **another terminal window**.

Navigate to the **portal** folder:

```bash
cd portal
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

# 🖥️ Access the Portal

Open your browser and go to:

```
http://localhost:5173
```

You should see the **Digital Election Portal**.

---

# 📁 Project Structure

```
project-root
│
├── start.sh
├── stop.sh
├── blockchain-election-dashboard/
├── chaincode/
├── config
├── hlf-explorer
├── rest-api
├── portal/        # React frontend
│
└── README.md
```

---

# 🔧 Common Troubleshooting

### ❌ peer command not found

Add Fabric bin to PATH:

```bash
export PATH=$PATH:~/fabric-samples/bin
```

---

### ❌ Docker not running

Start docker:

```bash
sudo systemctl start docker
```

---

### ❌ Node version incorrect

Check version:

```bash
node -v
```

Install correct version:

```bash
nvm install 22.21.1
```

---

# 🎉 You're Ready!

If everything is working:

* Fabric Network ✔
* Backend Services ✔
* Portal UI ✔

You can now start using the **Digital Election System**.

---

If you want, I can also help you create a **much more advanced README with**:

* Architecture diagram
* Hyperledger network diagram
* Screenshots
* Chaincode flow explanation
* Developer guide
* Production deployment guide.
