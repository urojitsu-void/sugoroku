import { useEffect, useState, type CSSProperties } from 'react'
import { Board } from './components/Board'
import { boardData, boardNodeMap, previousNodeMap, type MoveDirection } from './data/board'
import type { PlayerState } from './types/player'

interface BranchChoice {
  playerIndex: number
  options: string[]
  stepsRemaining: number
  direction: MoveDirection
}

interface MovementOutcome {
  players: PlayerState[]
  stepsRemaining: number
  branchOptions?: string[]
}

const PLAYER_COLORS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#845ef7']
const PLAYER_LABELS = ['V1', 'V2', 'V3', 'V4']

const styles: Record<string, CSSProperties> = {
  app: {
    minHeight: '100vh',
    padding: '1.5rem',
    background: 'radial-gradient(circle at 10% 20%, #1f2856, #0a0c1a 60%)',
    color: '#f3f5ff',
    fontFamily: `'Segoe UI', 'Hiragino Sans', 'Yu Gothic', sans-serif`,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: { textAlign: 'center' },
  boardSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  dicePanel: {
    flex: '0 0 260px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  diceValue: { fontSize: '4rem', fontWeight: 700, textAlign: 'center' },
  status: { minHeight: '3rem', whiteSpace: 'pre-line' },
  winner: {
    background: 'rgba(118,230,160,0.2)',
    border: '1px solid rgba(118,230,160,0.6)',
    borderRadius: 12,
    padding: '0.5rem',
    textAlign: 'center',
    fontWeight: 600,
  },
  resetButton: {
    marginTop: 'auto',
    borderRadius: 999,
    padding: '0.4rem 0.8rem',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
  },
  playersPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem',
  },
  playerCard: {
    borderRadius: 16,
    background: 'rgba(255,255,255,0.08)',
    padding: '0.8rem',
    border: '1px solid transparent',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  overlayCard: {
    background: 'rgba(7,11,31,0.95)',
    padding: '2rem',
    borderRadius: 24,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  overlayButtons: { display: 'flex', gap: '1rem', justifyContent: 'center' },
  overlayButton: {
    fontSize: '1.1rem',
    borderRadius: 12,
    padding: '0.6rem 1.2rem',
    border: 'none',
    cursor: 'pointer',
    background: '#4dabf7',
    color: '#050b17',
  },
  branchHint: {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    background: 'rgba(10,12,26,0.85)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: '0.8rem 1rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
    zIndex: 10,
  },
}

const resolveMovement = (
  players: PlayerState[],
  playerIndex: number,
  steps: number,
  direction: MoveDirection
): MovementOutcome => {
  let remaining = steps
  let workingPlayers = players

  while (remaining > 0) {
    const player = workingPlayers[playerIndex]
    if (!player) {
      break
    }

    const currentNode = boardNodeMap.get(player.positionId)
    const nextCandidates =
      direction === 'forward'
        ? currentNode?.next ?? []
        : previousNodeMap.get(player.positionId) ?? []

    if (nextCandidates.length === 0) {
      remaining = 0
      break
    }

    if (nextCandidates.length > 1) {
      return {
        players: workingPlayers,
        stepsRemaining: remaining,
        branchOptions: nextCandidates,
      }
    }

    const targetId = nextCandidates[0]
    workingPlayers = workingPlayers.map((state, idx) =>
      idx === playerIndex ? { ...state, positionId: targetId } : state
    )
    remaining -= 1
  }

  return { players: workingPlayers, stepsRemaining: remaining }
}

const rotatePlayer = (players: PlayerState[], finishedIndex: number) => {
  if (players.length === 0) {
    return { players, nextIndex: 0, skippedMessages: [] as string[] }
  }

  let nextIndex = finishedIndex
  let workingPlayers = players
  const skippedMessages: string[] = []
  const guardMax = players.length * 4
  let guard = 0

  while (guard < guardMax) {
    nextIndex = (nextIndex + 1) % players.length
    guard += 1

    const candidate = workingPlayers[nextIndex]
    if (!candidate) {
      continue
    }

    if (candidate.skipTurns > 0) {
      skippedMessages.push(`${candidate.name}はおやすみ`)
      workingPlayers = workingPlayers.map((state, idx) =>
        idx === nextIndex ? { ...state, skipTurns: state.skipTurns - 1 } : state
      )
      continue
    }

    return { players: workingPlayers, nextIndex, skippedMessages }
  }

  return { players: workingPlayers, nextIndex, skippedMessages }
}

function App() {
  const [players, setPlayers] = useState<PlayerState[]>([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [message, setMessage] = useState('プレイヤー人数を選んでスタート！')
  const [branchChoice, setBranchChoice] = useState<BranchChoice | null>(null)
  const [branchSelectionIndex, setBranchSelectionIndex] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [winnerId, setWinnerId] = useState<number | null>(null)

  const branchSelectedId = branchChoice
    ? branchChoice.options[branchSelectionIndex]
    : null

  const startGame = (count: number) => {
    const nextPlayers: PlayerState[] = Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      name: PLAYER_LABELS[idx],
      color: PLAYER_COLORS[idx],
      positionId: boardData.startId,
      skipTurns: 0,
    }))
    setPlayers(nextPlayers)
    setCurrentPlayerIndex(0)
    setBranchChoice(null)
    setBranchSelectionIndex(0)
    setWinnerId(null)
    setDiceResult(null)
    setIsMoving(false)
    setMessage('画面をクリックしてダイスを振ろう！')
  }

  const resetGame = () => {
    setPlayers([])
    setCurrentPlayerIndex(0)
    setBranchChoice(null)
    setBranchSelectionIndex(0)
    setWinnerId(null)
    setDiceResult(null)
    setIsMoving(false)
    setMessage('プレイヤー人数を選んでスタート！')
  }

  const continueMovement = (
    basePlayers: PlayerState[],
    playerIndex: number,
    steps: number,
    direction: MoveDirection
  ) => {
    if (steps <= 0) {
      finalizeLanding(basePlayers, playerIndex)
      return
    }

    const outcome = resolveMovement(basePlayers, playerIndex, steps, direction)
    setPlayers(outcome.players)

    if (outcome.branchOptions) {
      setBranchChoice({
        playerIndex,
        options: outcome.branchOptions,
        stepsRemaining: outcome.stepsRemaining,
        direction,
      })
      setBranchSelectionIndex(0)
      setMessage('分岐マス！←→キーで選んでクリックで決定')
      return
    }

    finalizeLanding(outcome.players, playerIndex)
  }

  const finalizeLanding = (state: PlayerState[], playerIndex: number) => {
    const player = state[playerIndex]
    if (!player) {
      setIsMoving(false)
      return
    }

    const node = boardNodeMap.get(player.positionId)
    if (!node) {
      setIsMoving(false)
      return
    }

    setMessage(`${player.name}：${node.title}｜${node.description}`)

    if (player.positionId === boardData.goalId) {
      setWinnerId(player.id)
      setIsMoving(false)
      return
    }

    const effect = node.effect

    if (effect?.type === 'move') {
      const extraSteps = Math.abs(effect.steps)
      const direction: MoveDirection = effect.steps > 0 ? 'forward' : 'backward'
      setTimeout(() => continueMovement(state, playerIndex, extraSteps, direction), 350)
      return
    }

    if (effect?.type === 'skip') {
      const updatedPlayers = state.map((candidate, idx) =>
        idx === playerIndex
          ? {
              ...candidate,
              skipTurns: candidate.skipTurns + effect.turns,
            }
          : candidate
      )
      setPlayers(updatedPlayers)
      setIsMoving(false)
      const rotation = rotatePlayer(updatedPlayers, playerIndex)
      setPlayers(rotation.players)
      setCurrentPlayerIndex(rotation.nextIndex)
      if (rotation.skippedMessages.length > 0) {
        setMessage(`${player.name}は${effect.turns}回休み！\n${rotation.skippedMessages.join(' / ')}`)
      }
      return
    }

    setIsMoving(false)
    const rotation = rotatePlayer(state, playerIndex)
    setPlayers(rotation.players)
    setCurrentPlayerIndex(rotation.nextIndex)
    if (rotation.skippedMessages.length > 0) {
      setMessage((prev) => `${prev}\n${rotation.skippedMessages.join(' / ')}`)
    }
  }

  const confirmBranchSelection = () => {
    if (!branchChoice) {
      return
    }

    const targetId = branchChoice.options[branchSelectionIndex] ?? branchChoice.options[0]
    setBranchChoice(null)

    setPlayers((prev) => {
      const updated = prev.map((player, idx) =>
        idx === branchChoice.playerIndex ? { ...player, positionId: targetId } : player
      )

      const remaining = branchChoice.stepsRemaining - 1
      if (remaining > 0) {
        continueMovement(updated, branchChoice.playerIndex, remaining, branchChoice.direction)
      } else {
        finalizeLanding(updated, branchChoice.playerIndex)
      }
      return updated
    })
  }

  const handleGlobalClick = () => {
    if (!players.length) {
      return
    }
    if (winnerId !== null) {
      return
    }
    if (branchChoice) {
      confirmBranchSelection()
      return
    }
    if (isMoving) {
      return
    }

    const currentPlayer = players[currentPlayerIndex]
    if (!currentPlayer) {
      return
    }

    const roll = Math.floor(Math.random() * 6) + 1
    setDiceResult(roll)
    setIsMoving(true)
    setMessage(`${currentPlayer.name}のダイス：${roll}`)
    continueMovement(players, currentPlayerIndex, roll, 'forward')
  }

  useEffect(() => {
    if (!branchChoice) {
      return
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setBranchSelectionIndex((prev) =>
          prev - 1 < 0 ? branchChoice.options.length - 1 : prev - 1
        )
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setBranchSelectionIndex((prev) => (prev + 1) % branchChoice.options.length)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [branchChoice])

  useEffect(() => {
    if (!branchChoice) {
      setBranchSelectionIndex(0)
    }
  }, [branchChoice])

  return (
    <main style={styles.app} onClick={handleGlobalClick}>
      <header style={styles.header}>
        <h1>VTuber配信用すごろく</h1>
        <p>クリックでダイスを振り、分岐は← → キーで選択＆クリックで決定</p>
      </header>

      <section style={styles.boardSection}>
        <Board
          board={boardData}
          players={players}
          branchOptions={branchChoice?.options ?? []}
          selectedBranchId={branchSelectedId}
          currentPlayerIndex={currentPlayerIndex}
        />
        <div style={styles.dicePanel} onClick={(event) => event.stopPropagation()}>
          <div style={styles.diceValue}>{diceResult ?? '？'}</div>
          <div>現在のプレイヤー：{players[currentPlayerIndex]?.name ?? '-'}</div>
          <div style={styles.status}>{message}</div>
          {winnerId !== null && (
            <div style={styles.winner}>{`おめでとう！${players.find((p) => p.id === winnerId)?.name ?? ''}がゴール`}</div>
          )}
          <button type="button" style={styles.resetButton} onClick={resetGame}>
            ゲームをリセット
          </button>
        </div>
      </section>

      <section style={styles.playersPanel} onClick={(event) => event.stopPropagation()}>
        {players.map((player, idx) => (
          <div
            key={player.id}
            style={{
              ...styles.playerCard,
              borderColor: idx === currentPlayerIndex ? '#ffcf56' : 'transparent',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: player.color }}>
              {player.name}
            </div>
            <div>位置：{boardNodeMap.get(player.positionId)?.title ?? '-'}</div>
            <div>一回休み：{player.skipTurns}</div>
          </div>
        ))}
      </section>

      {!players.length && (
        <div style={styles.overlay} onClick={(event) => event.stopPropagation()}>
          <div style={styles.overlayCard}>
            <h2>参加人数を選択</h2>
            <div style={styles.overlayButtons}>
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  style={styles.overlayButton}
                  onClick={() => startGame(count)}
                >
                  {count}人
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {branchChoice && (
        <div style={styles.branchHint}>
          <p>分岐を選択中：{branchChoice.options[branchSelectionIndex]}</p>
          <p>残りステップ：{branchChoice.stepsRemaining}</p>
        </div>
      )}
    </main>
  )
}

export default App
