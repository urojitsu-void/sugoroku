import React from 'react'

interface PlayerCountOverlayProps {
  active: boolean
  selectedCount: number
  onChange: (count: number) => void
  onConfirm: () => void
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 20,
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(7,11,31,0.95)',
  padding: '2rem',
  borderRadius: 24,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const buttonStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  borderRadius: 12,
  padding: '0.6rem 1.2rem',
  border: 'none',
  cursor: 'pointer',
  background: '#4dabf7',
  color: '#050b17',
}

export function PlayerCountOverlay({ active, selectedCount, onChange, onConfirm }: PlayerCountOverlayProps) {
  if (!active) return null

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>参加人数を選択</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              style={{
                ...buttonStyle,
                border: count === selectedCount ? '2px solid #ffcf56' : 'none',
              }}
              onClick={(event) => {
                event.stopPropagation()
                onChange(count)
              }}
            >
              {count}人
            </button>
          ))}
        </div>
        <p>← / → で選択、画面クリックで決定</p>
        <button type="button" style={{ ...buttonStyle, background: '#ffcf56' }} onClick={onConfirm}>
          この人数で開始
        </button>
      </div>
    </div>
  )
}
