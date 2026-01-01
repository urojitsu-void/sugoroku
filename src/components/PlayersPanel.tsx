import React from 'react'
import type { PlayerState } from '../types/player'
import { boardNodeMap } from '../data/board'

interface PlayersPanelProps {
  players: PlayerState[]
  currentPlayerIndex: number
  playerNames: string[]
}

const panelStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: '1rem',
}

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  background: 'rgba(255,255,255,0.08)',
  padding: '0.8rem',
  border: '1px solid transparent',
}

export function PlayersPanel({ players, currentPlayerIndex, playerNames }: PlayersPanelProps) {
  return (
    <section style={panelStyle}>
      {players.map((player, idx) => (
        <div
          key={player.id}
          style={{
            ...cardStyle,
            borderColor: idx === currentPlayerIndex ? '#ffcf56' : 'transparent',
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: player.color }}>
            {playerNames[player.id]}
          </div>
          <div>位置：{boardNodeMap.get(player.positionId)?.title ?? '-'}</div>
          <div>一回休み：{player.skipTurns}</div>
        </div>
      ))}
    </section>
  )
}
