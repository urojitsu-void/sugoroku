import React from 'react'
import type { BoardNode } from '../data/board'

interface TileDetailModalProps {
  node: BoardNode | null
  playerName: string | null
  onClose: () => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 30,
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(12,16,40,0.95)',
  color: '#f8f9ff',
  padding: '2rem',
  borderRadius: 24,
  width: 'min(480px, 90vw)',
  textAlign: 'center',
  boxShadow: '0 24px 40px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const buttonStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: '0.6rem 1.2rem',
  border: 'none',
  background: '#ffcf56',
  color: '#262120',
  fontWeight: 700,
  cursor: 'pointer',
}

export function TileDetailModal({ node, playerName, onClose }: TileDetailModalProps) {
  if (!node) return null

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        {playerName && <p style={{ margin: 0, fontSize: '1rem' }}>{playerName}が停止</p>}
        <h3 style={{ margin: 0, fontSize: '1.6rem' }}>{node.title}</h3>
        <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>{node.description}</p>
        <button type="button" style={buttonStyle} onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  )
}
