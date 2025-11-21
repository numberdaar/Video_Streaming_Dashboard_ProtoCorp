import React from 'react'
import Dashboard from './components/Dashboard'

export default function App(){
  return (
    <div>
      <header style={{padding:12, background:'#0b1220', color:'#fff'}}>
        <h1 style={{margin:0}}>Video Streaming Dashboard — React + HLS</h1>
        <p style={{margin:0, fontSize:12}}>6 players synchronized (demo)</p>
      </header>
      <main style={{padding:12}}>
        <Dashboard />
      </main>
    </div>
  )
}
