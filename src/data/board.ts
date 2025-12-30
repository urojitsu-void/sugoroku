import boardDefinitionJson from './board.json'
import { z } from 'zod'

const effectSchema = z.union([
  z.object({
    type: z.literal('move'),
    steps: z.number().int().min(-6).max(6).refine((val) => val !== 0, {
      message: 'steps must be different from 0',
    }),
  }),
  z.object({
    type: z.literal('skip'),
    turns: z.number().int().min(1).max(3),
  }),
])

const nodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  next: z.array(z.string()),
  kind: z.enum(['start', 'normal', 'bonus', 'penalty', 'rest', 'branch', 'goal']),
  effect: effectSchema.optional(),
})

const boardSchema = z
  .object({
    startId: z.string(),
    goalId: z.string(),
    nodes: z.array(nodeSchema),
  })
  .superRefine((data, ctx) => {
    const idCounts = data.nodes.reduce<Record<string, number>>((acc, node) => {
      acc[node.id] = (acc[node.id] ?? 0) + 1
      return acc
    }, {})

    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Node id "${id}" is duplicated`,
        })
      }
    })

    const knownIds = new Set(data.nodes.map((node) => node.id))

    if (!knownIds.has(data.startId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startId is not part of the node list',
      })
    }

    if (!knownIds.has(data.goalId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'goalId is not part of the node list',
      })
    }

    data.nodes.forEach((node) => {
      node.next.forEach((target) => {
        if (!knownIds.has(target)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node "${node.id}" references unknown next id "${target}"`,
          })
        }
      })
    })
  })

export type BoardData = z.infer<typeof boardSchema>
export type BoardNode = z.infer<typeof nodeSchema>
export type TileEffect = z.infer<typeof effectSchema>
export type MoveDirection = 'forward' | 'backward'

export const boardData: BoardData = boardSchema.parse(boardDefinitionJson)
export const boardNodes = boardData.nodes
export const boardNodeMap = new Map(boardNodes.map((node) => [node.id, node]))
export const boardConnections = boardNodes.flatMap((node) =>
  node.next.map((nextId) => ({ from: node.id, to: nextId }))
)

export const previousNodeMap = boardNodes.reduce<Map<string, string[]>>((acc, node) => {
  node.next.forEach((nextId) => {
    const current = acc.get(nextId) ?? []
    current.push(node.id)
    acc.set(nextId, current)
  })
  return acc
}, new Map())

export const rawBoardDefinition = boardDefinitionJson
export const boardSchemaDefinition = boardSchema
