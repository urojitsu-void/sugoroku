import React from 'react'
import type { PlayerState } from '../types/player'

interface ControlPanelProps {
  diceResult: number | null
  currentPlayer?: PlayerState
  message: string
  finishOrder: PlayerState[]
  onReset: () => void
  playerNames: string[]
}

const panelStyle: React.CSSProperties = {
  flex: '0 0 260px',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 24,
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
  border: '1px solid rgba(255,255,255,0.12)',
}

const valueStyle: React.CSSProperties = { fontSize: '4rem', fontWeight: 700, textAlign: 'center' }
const statusStyle: React.CSSProperties = { minHeight: '3rem', whiteSpace: 'pre-line' }
const winnerStyle: React.CSSProperties = {
  background: 'rgba(118,230,160,0.2)',
  border: '1px solid rgba(118,230,160,0.6)',
  borderRadius: 12,
  padding: '0.5rem',
  textAlign: 'center',
  fontWeight: 600,
}
const buttonStyle: React.CSSProperties = {
  marginTop: 'auto',
  borderRadius: 999,
  padding: '0.4rem 0.8rem',
  border: '1px solid rgba(255,255,255,0.4)',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
}

export function ControlPanel({ diceResult, currentPlayer, message, finishOrder, onReset, playerNames }: ControlPanelProps) {
  return (
    <div style={panelStyle}>
      <div style={valueStyle}>{diceResult ?? '？'}</div>
      <div>現在のプレイヤー：{currentPlayer ? playerNames[currentPlayer.id] : '-'}</div>
      <div style={statusStyle}>{message}</div>
      {finishOrder.length > 0 && (
        <div style={winnerStyle}>
          <strong>ゴール順位</strong>
          <ol>
            {finishOrder.map((player, index) => (
              <li key={player.id}>{`${index + 1}位: ${playerNames[player.id]}`}</li>
            ))}
          </ol>
        </div>
      )}
      <button type="button" style={buttonStyle} onClick={onReset}>
        ゲームをリセット
      </button>
    </div>
  )
}
