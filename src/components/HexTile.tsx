import React, { type ReactNode } from 'react'
import type { BoardNode } from '../data/board'
interface HexTileProps {
  node: BoardNode
  center: { x: number; y: number }
  width: number
  height: number
  isActive: boolean
  isBranchOption: boolean
  isBranchSelected: boolean
  children?: ReactNode
}

export const FLAT_HEX_POINTS = [
  { x: 0.25, y: 0 },
  { x: 0.75, y: 0 },
  { x: 1, y: 0.5 },
  { x: 0.75, y: 1 },
  { x: 0.25, y: 1 },
  { x: 0, y: 0.5 },
]

const COLOR_MAP: Record<BoardNode['kind'], { fill: string; border: string }> = {
  start: { fill: '#533657', border: '#ffb5d1' },
  goal: { fill: '#3a5a40', border: '#9effc7' },
  bonus: { fill: '#7e5a1a', border: '#ffd26c' },
  penalty: { fill: '#5f1e2c', border: '#ff96b0' },
  rest: { fill: '#1d3c64', border: '#8fd4ff' },
  branch: { fill: '#4d2b8a', border: '#c792ff' },
  normal: { fill: '#192336', border: '#7f8fa6' },
}

export function HexTile({
  node,
  center,
  width,
  height,
  isActive,
  isBranchOption,
  isBranchSelected,
  children,
}: HexTileProps) {
  const pointString = FLAT_HEX_POINTS.map((point) => `${point.x * width},${point.y * height}`).join(' ')
  const { fill, border } = COLOR_MAP[node.kind]
  const strokeWidth = isActive ? 3.5 : 2

  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: center.x - width / 2,
    top: center.y - height / 2,
    width,
    height,
    pointerEvents: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={wrapperStyle}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polygon
          points={pointString}
          fill={fill}
          stroke={isBranchSelected ? '#fff' : isBranchOption ? '#d8bfff' : border}
          strokeWidth={strokeWidth}
        />
        <foreignObject x={width * 0.15} y={height * 0.2} width={width * 0.7} height={height * 0.6}>
          {children}
        </foreignObject>
      </svg>
    </div>
  )
}
