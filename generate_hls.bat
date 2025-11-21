@echo off
setlocal

REM ----- SET YOUR FFMPEG PATH HERE -----
set FFMPEG="C:\ffmpeg\bin\ffmpeg.exe"

set RTSP=%1

if "%RTSP%"=="" (
    echo Usage: generate_hls.bat rtsp://your-stream-url
    exit /b
)

echo Creating HLS folder...
if not exist hls mkdir hls

for /L %%i in (1,1,6) do (
    echo Starting Stream %%i
    %FFMPEG% -rtsp_transport tcp -i %RTSP% -c:v copy -c:a aac -hls_time 1 -hls_list_size 3 -hls_flags delete_segments+append_list hls/stream%%i/index.m3u8 -loglevel error -y
)

endlocal
