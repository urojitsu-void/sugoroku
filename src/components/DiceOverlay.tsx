import React, { useEffect, useState } from 'react'
import dice1 from '../assets/1.png'
import dice2 from '../assets/2.png'
import dice3 from '../assets/3.png'
import dice4 from '../assets/4.png'
import dice5 from '../assets/5.png'
import dice6 from '../assets/6.png'
import diceAudio from '../assets/dice.mp3'

const DICE_IMAGES = [dice1, dice2, dice3, dice4, dice5, dice6]

interface DiceOverlayProps {
  rolling: boolean
  onComplete: (value: number) => void
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 15,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const imageBaseStyle: React.CSSProperties = {
  width: 180,
  height: 180,
  filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
  transition: 'transform 0.2s ease-out',
}

export function DiceOverlay({ rolling, onComplete }: DiceOverlayProps) {
  const [texture, setTexture] = useState(dice1)
  const [rotation, setRotation] = useState(0)
  const [start, setStart] = useState({ x: 50, y: 50 })
  const [end, setEnd] = useState({ x: 50, y: 50 })
  const [progress, setProgress] = useState(0)
  const [resultVisible, setResultVisible] = useState(false)
  const [sound] = useState(() => new Audio(diceAudio))

  useEffect(() => {
    if (!rolling) return
    const finalValue = Math.floor(Math.random() * 6) + 1
    const newStart = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }
    const newEnd = { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }
    setStart(newStart)
    setEnd(newEnd)
    setProgress(0)
    sound.currentTime = 0
    sound.play().catch(() => {})
    const frames = 12
    const baseInterval = 40
    for (let i = 0; i < frames; i += 1) {
      const value = i === frames - 1 ? finalValue : Math.floor(Math.random() * 6) + 1
      const interval = baseInterval + i * 15
      setTimeout(() => {
        setTexture(DICE_IMAGES[value - 1])
        setRotation((prev) => prev + 360)
        setProgress((i + 1) / frames)
        if (i === frames - 1) {
          setTimeout(() => {
            sound.pause()
            setResultVisible(true)
            setTimeout(() => {
              setResultVisible(false)
              onComplete(finalValue)
            }, 1200)
          }, interval)
        }
      }, i * interval)
    }
  }, [rolling, onComplete, sound])

  if (!rolling && !resultVisible) return null

  const currentX = start.x + (end.x - start.x) * progress
  const currentY = start.y + (end.y - start.y) * progress
  const transform = `translate(${currentX - 50}vw, ${currentY - 50}vh) rotate(${rotation}deg)`

  return (
    <div style={overlayStyle}>
      <img src={texture} alt="rolling dice" style={{ ...imageBaseStyle, transform }} />
    </div>
  )
}
