import React from 'react'

interface BranchChoiceModalProps {
  options: string[]
  currentIndex: number
  onChange: (index: number) => void
  onConfirm: () => void
  getNodeTitle: (id: string) => string
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 35,
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(12,16,40,0.95)',
  color: '#f8f9ff',
  padding: '2rem',
  borderRadius: 24,
  width: 'min(520px, 90vw)',
  textAlign: 'center',
  boxShadow: '0 24px 40px rgba(0,0,0,0.4)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
}

const optionStyle: React.CSSProperties = {
  borderRadius: 16,
  padding: '0.8rem 1rem',
  border: '2px solid transparent',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.1)',
}

export function BranchChoiceModal({ options, currentIndex, onChange, onConfirm, getNodeTitle }: BranchChoiceModalProps) {
  if (!options.length) return null

  return (
    <div style={overlayStyle} onClick={onConfirm}>
      <div style={cardStyle} onClick={(event) => event.stopPropagation()}>
        <h3>ルートを選択</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {options.map((id, index) => (
            <div
              key={id}
              style={{
                ...optionStyle,
                borderColor: index === currentIndex ? '#ffcf56' : 'transparent',
                background: index === currentIndex ? 'rgba(255,207,86,0.2)' : optionStyle.background,
              }}
              onClick={() => onChange(index)}
            >
              {getNodeTitle(id)}
            </div>
          ))}
        </div>
        <p>← / → で選択し、画面タップで決定</p>
      </div>
    </div>
  )
}
