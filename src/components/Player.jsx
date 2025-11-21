import React, {useEffect, useRef} from 'react'
import Hls from 'hls.js'

export default function Player({src, index, onReady}){
  const videoRef = useRef(null)
  useEffect(()=>{
    const video = videoRef.current
    if(!video) return
    // If native HLS is supported (Safari), set src directly
    if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src = src
    } else if(Hls.isSupported()){
      const hls = new Hls({
        // enable lowLatencyMode for HLS if the stream supports it
        lowLatencyMode: true,
        maxBufferLength: 30
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (event, data) => {
        // simple console logging for errors
        console.warn('HLS error', data)
      })
      return ()=> hls.destroy()
    } else {
      console.error('HLS not supported in this browser')
    }
  },[src])

  useEffect(()=>{
    const el = videoRef.current
    if(!el) return
    const onPlay = ()=> onReady(index, el)
    el.addEventListener('play', onPlay)
    return ()=> el.removeEventListener('play', onPlay)
  },[index,onReady])

  return (
    <div>
      <video ref={videoRef} controls style={{width:'100%', borderRadius:6, background:'#000'}} playsInline />
      <div className="controls">
        <small>Stream #{index+1}</small>
      </div>
    </div>
  )
}
