/*
Simple Express server to serve the /hls folder where FFmpeg will write HLS segments.
Run with: node server.js
*/
const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 8080

app.use('/hls', express.static(path.join(__dirname, 'hls')))
app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(PORT, ()=> {
  console.log(`Static server running. Serving /hls at http://localhost:${PORT}/hls/`)
})
