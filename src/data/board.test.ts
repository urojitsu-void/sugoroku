import {
  boardData,
  boardNodeMap,
  boardSchemaDefinition,
  previousNodeMap,
  rawBoardDefinition,
} from './board'

describe('board definition', () => {
  test('zod schema validation passes', () => {
    expect(() => boardSchemaDefinition.parse(rawBoardDefinition)).not.toThrow()
  })

  test('goal is reachable from start', () => {
    const visited = new Set<string>()
    const queue: string[] = [boardData.startId]

    while (queue.length > 0) {
      const id = queue.shift()!
      if (visited.has(id)) continue
      visited.add(id)
      const node = boardNodeMap.get(id)
      node?.next.forEach((nextId) => {
        if (!visited.has(nextId)) {
          queue.push(nextId)
        }
      })
    }

    expect(visited.has(boardData.goalId)).toBe(true)
  })

  test('move effects always have enough reachable tiles', () => {
    const canTravel = (startId: string, steps: number, direction: 'forward' | 'backward') => {
      let frontier = new Set([startId])

      for (let step = 0; step < steps; step += 1) {
        const nextFrontier = new Set<string>()
        frontier.forEach((nodeId) => {
          const node = boardNodeMap.get(nodeId)
          const neighbors = direction === 'forward' ? node?.next ?? [] : previousNodeMap.get(nodeId) ?? []
          neighbors.forEach((candidate) => nextFrontier.add(candidate))
        })
        frontier = nextFrontier
        if (frontier.size === 0) {
          return false
        }
      }

      return frontier.size > 0
    }

    boardData.nodes.forEach((node) => {
      if (node.effect?.type !== 'move') {
        return
      }
      const steps = Math.abs(node.effect.steps)
      const direction = node.effect.steps > 0 ? 'forward' : 'backward'
      expect(canTravel(node.id, steps, direction)).toBe(true)
    })
  })
})
