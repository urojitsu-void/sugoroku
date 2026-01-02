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
    justifyContent: 'space-around',
    padding: 4,
  }

  const titleStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: Math.min(width * 0.14, 30),
    lineHeight: 1.2,
    margin: 0,
    color: '#fff',
    textAlign: 'center',
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
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
      {players.length > 0 &&
        <div style={tokensStyle}>
          {players.map((player) => (
            <span
              key={player.id}
              style={{
                backgroundColor: player.color,
                width: Math.min(width * 0.24, 36),
                height: Math.min(width * 0.24, 36),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.min(width * 0.09, 15),
                fontWeight: 700,
                color: '#06132a',
                boxShadow: '0 0 6px rgba(0,0,0,0.4)',
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
