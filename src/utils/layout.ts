import type { BoardData, BoardNode } from '../data/board'

export interface LayoutEntry {
  node: BoardNode
  column: number
  row: number
  rowsInColumn: number
}

export interface LayoutResult {
  entries: LayoutEntry[]
  positions: Map<string, LayoutEntry>
  columnCount: number
}

export const computeBoardLayout = (board: BoardData): LayoutResult => {
  const nodeMap = new Map(board.nodes.map((node) => [node.id, node]))

  const columnMap = new Map<string, number>()
  const queue: Array<{ id: string; level: number }> = [{ id: board.startId, level: 0 }]
  columnMap.set(board.startId, 0)

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = nodeMap.get(current.id)
    if (!node) {
      continue
    }

    node.next.forEach((nextId) => {
      const nextLevel = current.level + 1
      const existing = columnMap.get(nextId)
      if (existing === undefined || nextLevel < existing) {
        columnMap.set(nextId, nextLevel)
        queue.push({ id: nextId, level: nextLevel })
      }
    })
  }

  const levels = [...columnMap.values()]
  const baseMaxLevel = levels.length > 0 ? Math.max(...levels) : 0
  board.nodes.forEach((node) => {
    if (!columnMap.has(node.id)) {
      columnMap.set(node.id, baseMaxLevel + 1)
    }
  })

  const columnCount = Math.max(...columnMap.values(), 0) + 1

  const orderMap = new Map<string, number>()
  let order = 0
  const visit = (id: string) => {
    if (orderMap.has(id)) {
      return
    }
    orderMap.set(id, order)
    order += 1
    nodeMap.get(id)?.next.forEach((nextId) => visit(nextId))
  }
  visit(board.startId)
  board.nodes.forEach((node) => {
    if (!orderMap.has(node.id)) {
      orderMap.set(node.id, order)
      order += 1
    }
  })

  const columnBuckets = new Map<number, BoardNode[]>()
  board.nodes.forEach((node) => {
    const column = columnMap.get(node.id) ?? 0
    const bucket = columnBuckets.get(column) ?? []
    bucket.push(node)
    columnBuckets.set(column, bucket)
  })

  const entries: LayoutEntry[] = []
  columnBuckets.forEach((nodes, column) => {
    nodes.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
    nodes.forEach((node, idx) => {
      entries.push({ node, column, row: idx, rowsInColumn: nodes.length })
    })
  })

  const positions = new Map(entries.map((entry) => [entry.node.id, entry]))

  return { entries, positions, columnCount }
}
