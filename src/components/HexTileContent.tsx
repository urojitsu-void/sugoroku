import React from 'react'
import type { PlayerState } from '../types/player'
import type { BoardNode } from '../data/board'

interface HexTileContentProps {
  node: BoardNode
  players: PlayerState[]
  width: number
}

export function HexTileContent({ node, players, width }: HexTileContentProps) {
  const contentStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 2,
  }

  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: Math.min(width * 0.11, 18),
    lineHeight: 1.2,
    margin: 0,
    color: '#fff',
    textAlign: 'center',
  }

  const descriptionStyle: React.CSSProperties = {
    fontSize: Math.min(width * 0.09, 14),
    lineHeight: 1.2,
    margin: 0,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  }

  const badgeStyle: React.CSSProperties = {
    fontSize: Math.min(width * 0.08, 12),
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  }

  const tokensStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
    flexWrap: 'wrap',
  }

  return (
    <div style={contentStyle}>
      <p style={titleStyle}>{node.title}</p>
      <p style={descriptionStyle}>{node.description}</p>
      <div style={badgeStyle}>{node.kind === 'goal' ? 'GOAL' : node.kind === 'start' ? 'START' : ''}</div>
      {players.length > 0 &&
        <div style={tokensStyle}>
          {players.map((player) => (
            <span
              key={player.id}
              style={{
                backgroundColor: player.color,
                color: '#06132a',
                borderRadius: 999,
                padding: '0 2px',
                fontSize: Math.min(width * 0.08, 12),
                fontWeight: 700,
              }}
            >
              {player.name}
            </span>
          ))}
        </div>
      }
    </div>
  )
}
