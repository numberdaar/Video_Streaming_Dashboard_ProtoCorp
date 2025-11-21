import React, {useRef, useEffect, useState} from 'react'
import Player from './Player'

/*
  Dashboard shows 6 players in a responsive grid.
  The sync strategy:
  - Pick a leader (player 0).
  - When leader plays, set all others to leader.currentTime and play.
  - Periodically (every 700ms) measure drift and correct if drift > 0.5s.
  - This is best-effort synchronization for HLS in browsers.
*/

const NUM_PLAYERS = 6

const defaultStreams = Array.from({length:NUM_PLAYERS}).map((_,i) => `/hls/stream${i+1}/index.m3u8`)

export default function Dashboard(){
  const playerRefs = useRef([])
  const [streams] = useState(defaultStreams)
  const syncTimer = useRef(null)

  useEffect(()=> {
    // periodic synchronization loop
    syncTimer.current = setInterval(()=>{
      const leader = playerRefs.current[0]
      if(!leader || leader.paused) return
      const leaderTime = leader.currentTime || 0
      for(let i=1;i<playerRefs.current.length;i++){
        const v = playerRefs.current[i]
        if(!v) continue
        const drift = Math.abs((v.currentTime||0) - leaderTime)
        if(drift > 0.5){
          try{
            v.currentTime = leaderTime
          }catch(e){}
        }
      }
    },700)

    return ()=> clearInterval(syncTimer.current)
  },[])

  const onPlayerReady = (index, videoEl) => {
    playerRefs.current[index] = videoEl
  }

  const playAll = async () => {
    // set all to 0 and play together
    for(const v of playerRefs.current){
      if(!v) continue
      try{
        v.currentTime = playerRefs.current[0]?.currentTime || 0
      }catch(e){}
    }
    // call play for all (browser may require user interaction)
    for(const v of playerRefs.current){
      if(!v) continue
      try{ await v.play() }catch(e){}
    }
  }

  const pauseAll = () => {
    for(const v of playerRefs.current){
      if(!v) continue
      try{ v.pause() }catch(e){}
    }
  }

  return (
    <div>
      <div style={{display:'flex',gap:8, marginBottom:12}}>
        <button onClick={playAll}>Play All</button>
        <button onClick={pauseAll}>Pause All</button>
        <small>Leader = top-left player. Works best with low-latency HLS and aligned segments.</small>
      </div>
      <div className="dashboard-grid">
        {streams.map((src,idx) => (
          <div key={idx} className="card">
            <Player src={src} index={idx} onReady={onPlayerReady} />
          </div>
        ))}
      </div>
    </div>
  )
}
