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
  fontSize: '1.4rem',
  fontWeight: 700,
  borderRadius: 16,
  padding: '0.8rem 1.6rem',
  border: 'none',
  cursor: 'pointer',
  background: '#4dabf7',
  color: '#ffffff',
}

export function PlayerCountOverlay({ active, selectedCount, onChange, onConfirm }: PlayerCountOverlayProps) {
  if (!active) return null

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>参加人数を選択</h2>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              style={{
                ...buttonStyle,
                border: count === selectedCount ? '3px solid #ffcf56' : 'none',
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
        <p style={{ fontSize: '1.1rem' }}>← / → で選択、画面クリックで決定</p>
        <button
          type="button"
          style={{ ...buttonStyle, background: '#ffcf56', color: '#1a1a1a' }}
          onClick={onConfirm}
        >
          この人数で開始
        </button>
      </div>
    </div>
  )
}
