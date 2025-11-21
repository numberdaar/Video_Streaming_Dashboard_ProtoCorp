#!/usr/bin/env bash
# generate_hls.sh
# This script spawns multiple ffmpeg processes that consume the RTSP source and produce different HLS outputs.
# NOTE: Make sure ffmpeg is installed on the machine where you run this.
#
# Strategy:
# - Produce 6 HLS directories: hls/stream1 ... hls/stream6
# - For streams 2..6, we apply a small presentation timestamp offset (setpts) to simulate slight
#  differences (delays) while keeping content identical. This is useful for testing synchronization logic.
#
# Example usage:
# chmod +x generate_hls.sh
# ./generate_hls.sh rtsp://13.60.76.79:8554/live
#
RTSP_URL="$1"
if [ -z "$RTSP_URL" ]; then
  echo "Usage: $0 <rtsp_url>"
  exit 1
fi

mkdir -p hls
# kills previously running ffmpeg processes started by this script - CAREFUL
# pkill -f "ffmpeg.*stream" || true

for i in 1 2 3 4 5 6; do
  outdir="hls/stream${i}"
  mkdir -p "$outdir"
  # introduce incremental delays for streams 2..6
  delay_seconds=$(( (i-1) * 0 )) # set to 0 for identical; change to 0.5 or 1 to simulate delay
  # If you want to shift stream by X seconds, use setpts=PTS+X/TB
  setpts_filter=""
  if [ "$delay_seconds" != "0" ]; then
    setpts_filter="-vf \"setpts=PTS+${delay_seconds}/TB\""
  fi

  # ffmpeg command: continuous HLS generation with reasonable segment length
  # Note: using -hls_flags delete_segments keeps disk usage bounded.
  cmd=(ffmpeg -hide_banner -loglevel info -i "$RTSP_URL" -c:v copy -c:a aac -f hls -hls_time 2 -hls_list_size 5 -hls_flags delete_segments+append_list -hls_allow_cache 0 "$outdir/index.m3u8")
  echo "Starting stream ${i} -> ${outdir}/index.m3u8"
  # Run in background
  ( "${cmd[@]}" ) &
done

echo "Started ffmpeg processes. HLS will be available under ./hls/streamN/index.m3u8"
echo "Serve the folder using: node server.js  (or any static file server) and open http://localhost:8080/hls/stream1/index.m3u8"
