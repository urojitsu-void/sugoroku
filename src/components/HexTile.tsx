import React, { type ReactNode } from 'react'
interface HexTileProps {
  center: { x: number; y: number }
  width: number
  height: number
  isActive: boolean
  isBranchOption: boolean
  isBranchSelected: boolean
  fill: string
  border: string
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

export function HexTile({
  center,
  width,
  height,
  isActive,
  isBranchOption,
  isBranchSelected,
  fill,
  border,
  children,
}: HexTileProps) {
  const pointString = FLAT_HEX_POINTS.map((point) => `${point.x * width},${point.y * height}`).join(' ')
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
        <foreignObject x={width * 0.1} y={height * 0.15} width={width * 0.8} height={height * 0.7}>
          {children}
        </foreignObject>
      </svg>
    </div>
  )
}
