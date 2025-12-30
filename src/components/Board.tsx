import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import type { BoardData } from '../data/board'
import type { PlayerState } from '../types/player'
import { computeBoardLayout, type LayoutEntry } from '../utils/layout'
import { HexTile } from './HexTile'
import { HexTileContent } from './HexTileContent'
import type { BoardNode } from '../data/board'

interface BoardProps {
  board: BoardData
  players: PlayerState[]
  branchOptions: string[]
  selectedBranchId: string | null
  currentPlayerIndex: number
}

interface Dimensions {
  width: number
  height: number
}

const useElementSize = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Dimensions>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}

interface GeometrySpec {
  hexWidth: number
  hexHeight: number
  spacingX: number
  spacingY: number
  maxRows: number
}

const LEFT_ROUTE_IDS = new Set(['leftLaugh', 'leftDetour', 'leftMemory'])
const RIGHT_ROUTE_IDS = new Set(['rightGame', 'rightSecret', 'rightShortcut'])

const getTileColors = (node: BoardNode, board: BoardData) => {
  if (node.id === board.startId) return { fill: '#533657', border: '#ffb5d1' }
  if (node.id === board.goalId) return { fill: '#3a5a40', border: '#9effc7' }
  if (node.id === 'branchGate') return { fill: '#4d2b8a', border: '#c792ff' }
  if (node.id === 'reunion') return { fill: '#1b4f5a', border: '#8ef0c9' }
  if (LEFT_ROUTE_IDS.has(node.id)) return { fill: '#c06c36', border: '#ffd6ae' }
  if (RIGHT_ROUTE_IDS.has(node.id)) return { fill: '#1f4ca0', border: '#93bbff' }
  return { fill: '#1c2336', border: '#7f8fa6' }
}

const projectPosition = (
  entry: LayoutEntry,
  size: Dimensions,
  columnCount: number,
  geometry: GeometrySpec
) => {
  const { hexWidth, hexHeight, spacingX, spacingY, maxRows } = geometry
  const width = Math.max(size.width, hexWidth + 40)
  const height = Math.max(size.height, hexHeight + 40)

  const totalWidth = hexWidth + spacingX * Math.max(columnCount - 1, 0)
  const xStart = Math.max(hexWidth / 2, (width - totalWidth) / 2 + hexWidth / 2)
  const totalHeight = hexHeight + (maxRows - 1) * spacingY + spacingY / 2
  const yStart = Math.max(hexHeight / 2, (height - totalHeight) / 2 + hexHeight / 2)

  const x = xStart + entry.column * spacingX
  const parityOffset = entry.column % 2 === 0 ? 0 : spacingY / 2
  const y = yStart + entry.row * spacingY + parityOffset

  return { x, y }
}

export function Board({ board, players, branchOptions, selectedBranchId, currentPlayerIndex }: BoardProps) {
  const { ref: boardRef, size } = useElementSize()
  const layout = useMemo(() => computeBoardLayout(board), [board])

  const geometry = useMemo<GeometrySpec>(() => {
    const width = Math.max(size.width, 400)
    const height = Math.max(size.height, 400)
    const baseHexWidth = Math.min(180, Math.max(110, width / Math.max(layout.columnCount * 0.8, 1)))
    const hexWidth = baseHexWidth
    const hexHeight = hexWidth * Math.sqrt(3) * 0.5
    const spacingX = hexWidth * 0.75
    const spacingY = hexHeight
    const maxRows = layout.entries.reduce((acc, entry) => Math.max(acc, entry.row + 1), 1)
    const requiredHeight = hexHeight + (maxRows - 1) * spacingY + spacingY / 2
    const scale = Math.min(1, (height - 40) / requiredHeight)
    return {
      hexWidth: hexWidth * scale,
      hexHeight: hexHeight * scale,
      spacingX: spacingX * scale,
      spacingY: spacingY * scale,
      maxRows,
    }
  }, [layout, size.height, size.width])

  const projections = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    layout.entries.forEach((entry) => {
      const coords = projectPosition(entry, size, layout.columnCount, geometry)
      map.set(entry.node.id, coords)
    })
    return map
  }, [geometry, layout, size])

  const playersByNode = useMemo(() => {
    const grouping = new Map<string, PlayerState[]>()
    players.forEach((player) => {
      const list = grouping.get(player.positionId) ?? []
      list.push(player)
      grouping.set(player.positionId, list)
    })
    return grouping
  }, [players])

  const highlightNodeId = players[currentPlayerIndex]?.positionId
  const branchOptionSet = useMemo(() => new Set(branchOptions), [branchOptions])

  const boardStyle: CSSProperties = {
    position: 'relative',
    flex: '1 1 640px',
    aspectRatio: '4 / 3',
    borderRadius: 32,
    background: 'radial-gradient(circle, rgba(255,255,255,0.05), rgba(0,0,0,0.45))',
    overflow: 'auto',
    padding: '1rem',
  }

  return (
    <div ref={boardRef} style={boardStyle}>
      {layout.entries.map((entry) => {
        const coords = projections.get(entry.node.id)
        if (!coords) {
          return null
        }
        const playersOnNode = playersByNode.get(entry.node.id) ?? []
        const colors = getTileColors(entry.node, board)
        return (
          <HexTile
            key={entry.node.id}
            center={coords}
            width={geometry.hexWidth}
            height={geometry.hexHeight}
            isActive={entry.node.id === highlightNodeId}
            isBranchOption={branchOptionSet.has(entry.node.id)}
            isBranchSelected={!!selectedBranchId && entry.node.id === selectedBranchId}
            fill={colors.fill}
            border={colors.border}
          >
            <HexTileContent
              node={entry.node}
              players={playersOnNode}
              width={geometry.hexWidth * 0.7}
            />
          </HexTile>
        )
      })}
    </div>
  )
}
