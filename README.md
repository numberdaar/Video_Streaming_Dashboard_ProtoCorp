# 🎥 Video Streaming Dashboard (React + HLS)

This repository contains a **React-based multi-camera video dashboard** capable of displaying **6 HLS streams simultaneously** while attempting to keep them **time-synchronized**.

It includes everything required for HLS generation, local hosting, and frontend playback.

---

# 📌 Overview

This project demonstrates:

- Converting an **RTSP feed → HLS** using `ffmpeg`
- Generating **6 distinct simulated HLS streams**
- Serving HLS folders using a simple **Node/Express server**
- A React dashboard that:
  - Loads 6 HLS video players
  - Uses `hls.js`
  - Implements a **video drift-correction algorithm** for synchronization

---

# 🔧 RTSP → HLS Conversion (Technical Explanation)

We use **FFmpeg** to convert a single RTSP feed into 6 independent HLS playlists.

**Example RTSP source:**

```
rtsp://13.60.76.79:8554/live2
```

FFmpeg reads the RTSP stream via TCP and produces `.m3u8` + `.ts` segments.

### ⚙️ Key FFmpeg Concepts Used

| Option | Explanation |
|--------|-------------|
| `-rtsp_transport tcp` | Reliable RTSP pulling |
| `-c:v copy` | Copy codec → low CPU, low latency |
| `-c:a aac` | Browser-compatible audio |
| `-hls_time 1` | 1-second segments for lower sync drift |
| `-hls_list_size 3` | Short playlist for minimal delay |
| `-hls_flags delete_segments+append_list` | Auto delete old segments |

Each FFmpeg process produces:

```
/hls/stream1/index.m3u8
/hls/stream2/index.m3u8
...
/hls/stream6/index.m3u8
```

---

# 🧪 How 6 Distinct HLS Streams Are Generated / Simulated

We simulate 6 camera feeds from one RTSP source by spawning **six parallel FFmpeg processes**, each writing to its own folder.

### ✔️ Method Used in This Repository

- Run **6 FFmpeg instances** in parallel  
- Each writes into a different HLS directory  
- Optional timestamp delay simulation using:

```
-vf "setpts=PTS+0.5/TB"
```

This simulates:
- Natural latency differences
- Multi-camera architecture
- Real-world distributed feeds

---

# 🧠 React Synchronization Logic (Technical Explanation)

Perfect sync across multiple HLS players in a browser is **not possible**, but we use a **best-effort algorithm**.

### ✔️ Synchronization Algorithm

1. **Choose a leader video** (`stream1`)
2. On leader `play`, all other players jump to the same timestamp
3. **Every 700ms**, check drift:
   - If drift > **0.5s**, force-reset:
     ```js
     video.currentTime = leader.currentTime;
     ```
4. Short HLS segments help maintain alignment

### ✔️ Files That Contain Sync Logic

- `src/components/Dashboard.jsx`
- `src/components/Player.jsx`

---

# 🛠️ Project Structure

```
project/
│
├── hls/                    # FFmpeg output (auto-generated)
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   └── Player.jsx
│   └── App.jsx
│
├── generate_hls.sh         # RTSP → HLS (Linux/Mac)
├── generate_hls.bat        # RTSP → HLS (Windows)
├── server.js               # Node server for static + HLS hosting
└── README.md
```

---

# 🚀 How to Run the Project

## 1️⃣ Install Dependencies

```
npm install
```

---

## 2️⃣ Start the Node/Express Server

```
npm run start-server
```

Server runs at:

```
http://localhost:8080
```

---

## 3️⃣ Generate HLS Streams Using FFmpeg

### 🔸 On Linux / macOS:

```
chmod +x generate_hls.sh
./generate_hls.sh rtsp://13.60.76.79:8554/live2
```

### 🔸 On Windows (PowerShell):

```
.\generate_hls.bat rtsp://13.60.76.79:8554/live2
```

This will generate:

```
hls/stream1/index.m3u8
...
hls/stream6/index.m3u8
```

---

## 4️⃣ Start the React Application

```
npm run dev
```

Open:

```
http://localhost:5173
```

---

# 🔗 Stream URLs Expected by the Dashboard

```
http://localhost:8080/hls/stream1/index.m3u8
http://localhost:8080/hls/stream2/index.m3u8
...
http://localhost:8080/hls/stream6/index.m3u8
```

---

# 👤 Author

**Ankit**
