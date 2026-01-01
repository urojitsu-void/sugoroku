import { useEffect, useState, type CSSProperties } from 'react'
import goalAudio from './assets/goal.mp3'
import { Board } from './components/Board'
import { DiceOverlay } from './components/DiceOverlay'
import { PlayerCountOverlay } from './components/PlayerCountOverlay'
import { ControlPanel } from './components/ControlPanel'
import { PlayersPanel } from './components/PlayersPanel'
import { TileDetailModal } from './components/TileDetailModal'
import { BranchChoiceModal } from './components/BranchChoiceModal'
import { boardData, boardNodeMap, previousNodeMap, type MoveDirection, type BoardNode } from './data/board'
import type { PlayerState } from './types/player'

interface BranchChoice {
  playerIndex: number
  options: string[]
  stepsRemaining: number
  direction: MoveDirection
  snapshot: PlayerState[]
}

const PLAYER_COLORS = ['#ff6b6b', '#4dabf7', '#ffd43b', '#845ef7']
const PLAYER_BOARD_LABELS = ['P1', 'P2', 'P3', 'P4']
const PLAYER_NAMES = ['Player1', 'Player2', 'Player3', 'Player4']
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

    if (candidate.finished) {
      continue
    }

    if (candidate.skipTurns > 0) {
      skippedMessages.push(`${PLAYER_NAMES[candidate.id]}はおやすみ`)
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
  const [pendingPlayerCount, setPendingPlayerCount] = useState(1)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [diceResult, setDiceResult] = useState<number | null>(null)
  const [finishOrder, setFinishOrder] = useState<PlayerState[]>([])
  const [message, setMessage] = useState('プレイヤー人数を選んでスタート！')
  const [branchChoice, setBranchChoice] = useState<BranchChoice | null>(null)
  const [branchSelectionIndex, setBranchSelectionIndex] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [isDiceRolling, setIsDiceRolling] = useState(false)
  const [goalSound] = useState(() => new Audio(goalAudio))
  const [detailNode, setDetailNode] = useState<BoardNode | null>(null)
  const [detailPlayer, setDetailPlayer] = useState<string | null>(null)

  const branchSelectedId = branchChoice
    ? branchChoice.options[branchSelectionIndex]
    : null

  const startGame = (count: number) => {
    const nextPlayers: PlayerState[] = Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      name: PLAYER_BOARD_LABELS[idx],
      color: PLAYER_COLORS[idx],
      positionId: boardData.startId,
      skipTurns: 0,
      finished: false,
    }))
    setPlayers(nextPlayers)
    setCurrentPlayerIndex(0)
    setBranchChoice(null)
    setBranchSelectionIndex(0)
    setFinishOrder([])
    setDiceResult(null)
    setIsMoving(false)
    setMessage('画面をクリックしてダイスを振ろう！')
    setPendingPlayerCount(count)
    setDetailNode(null)
    setDetailPlayer(null)
  }

  const resetGame = () => {
    setPlayers([])
    setCurrentPlayerIndex(0)
    setBranchChoice(null)
    setBranchSelectionIndex(0)
    setFinishOrder([])
    setDiceResult(null)
    setIsMoving(false)
    setMessage('プレイヤー人数を選んでスタート！')
    setDetailNode(null)
    setDetailPlayer(null)
  }

  const animateDice = () => {
    setIsDiceRolling(true)
  }

  const continueMovement = (
    basePlayers: PlayerState[],
    playerIndex: number,
    steps: number,
    direction: MoveDirection
  ) => {
    const stepMove = (currentState: PlayerState[], remaining: number) => {
      if (remaining <= 0) {
        finalizeLanding(currentState, playerIndex)
        return
      }

      const player = currentState[playerIndex]
      if (!player) {
        finalizeLanding(currentState, playerIndex)
        return
      }

      const currentNode = boardNodeMap.get(player.positionId)
      const nextCandidates =
        direction === 'forward'
          ? currentNode?.next ?? []
          : previousNodeMap.get(player.positionId) ?? []

      if (nextCandidates.length === 0) {
        finalizeLanding(currentState, playerIndex)
        return
      }

      if (nextCandidates.length > 1) {
        setBranchChoice({
          playerIndex,
          options: nextCandidates,
          stepsRemaining: remaining,
          direction,
          snapshot: currentState,
        })
        setBranchSelectionIndex(0)
        setIsMoving(false)
        setMessage('分岐マス！←→キーで選んでクリックで決定')
        return
      }

      const targetId = nextCandidates[0]
      const updated = currentState.map((candidate, idx) =>
        idx === playerIndex ? { ...candidate, positionId: targetId } : candidate
      )
      setPlayers(updated)
      setTimeout(() => stepMove(updated, remaining - 1), 350)
    }

    setIsMoving(true)
    stepMove(basePlayers, steps)
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

    setMessage(`${PLAYER_NAMES[player.id]}：${node.title}｜${node.description}`)
    setDetailNode(node)
    setDetailPlayer(PLAYER_NAMES[player.id])

    if (player.positionId === boardData.goalId) {
      const updatedPlayers = state.map((candidate, idx) =>
        idx === playerIndex ? { ...candidate, finished: true } : candidate
      )
      setPlayers(updatedPlayers)
      const snapshot = { ...updatedPlayers[playerIndex] }
      setFinishOrder((prev) => {
        if (prev.some((p) => p.id === snapshot.id)) return prev
        return [...prev, snapshot]
      })
      goalSound.currentTime = 0
      goalSound.play().catch(() => { })
      const rotation = rotatePlayer(updatedPlayers, playerIndex)
      setPlayers(rotation.players)
      setCurrentPlayerIndex(rotation.nextIndex)
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
        setMessage(`${PLAYER_NAMES[player.id]}は${effect.turns}回休み！\n${rotation.skippedMessages.join(' / ')}`)
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

    const baseState = branchChoice.snapshot
    const updated = baseState.map((player, idx) =>
      idx === branchChoice.playerIndex ? { ...player, positionId: targetId } : player
    )
    setPlayers(updated)

    const remaining = branchChoice.stepsRemaining - 1
    if (remaining > 0) {
      continueMovement(updated, branchChoice.playerIndex, remaining, branchChoice.direction)
    } else {
      finalizeLanding(updated, branchChoice.playerIndex)
    }
  }

  const handleGlobalClick = () => {
    if (!players.length) {
      startGame(pendingPlayerCount)
      return
    }
    if (players.length > 0 && finishOrder.length === players.length) {
      return
    }
    if (branchChoice) {
      confirmBranchSelection()
      return
    }
    if (isMoving || isDiceRolling) {
      return
    }

    const currentPlayer = players[currentPlayerIndex]
    if (!currentPlayer) {
      return
    }

    setMessage(`${PLAYER_NAMES[currentPlayer.id]}のダイスをロール中…`)
    animateDice()
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!players.length) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          setPendingPlayerCount((prev) => (prev - 1 < 1 ? 4 : prev - 1))
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          setPendingPlayerCount((prev) => (prev + 1 > 4 ? 1 : prev + 1))
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          startGame(pendingPlayerCount)
        }
        return
      }

      if (!branchChoice) {
        return
      }

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
  }, [branchChoice, pendingPlayerCount, players.length])

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
        <ControlPanel
          diceResult={diceResult}
          currentPlayer={players[currentPlayerIndex]}
          message={message}
          finishOrder={finishOrder}
          onReset={resetGame}
          playerNames={PLAYER_NAMES}
        />
      </section>

      <section onClick={(event) => event.stopPropagation()}>
        <PlayersPanel players={players} currentPlayerIndex={currentPlayerIndex} playerNames={PLAYER_NAMES} />
      </section>

      {!players.length && (
        <PlayerCountOverlay
          active={!players.length}
          selectedCount={pendingPlayerCount}
          onChange={setPendingPlayerCount}
          onConfirm={() => startGame(pendingPlayerCount)}
        />
      )}

      {branchChoice && (
        <div style={styles.branchHint}>
          <p>分岐を選択中：{branchChoice.options[branchSelectionIndex]}</p>
          <p>残りステップ：{branchChoice.stepsRemaining}</p>
        </div>
      )}

      <DiceOverlay
        rolling={isDiceRolling}
        onComplete={(value) => {
          setIsDiceRolling(false)
          setDiceResult(value)
          const current = players[currentPlayerIndex]
          const label = current ? PLAYER_NAMES[current.id] : ''
          setMessage(`${label}のダイス：${value}`)
          continueMovement(players, currentPlayerIndex, value, 'forward')
        }}
      />

      <TileDetailModal
        node={detailNode}
        playerName={detailPlayer}
        onClose={() => {
          setDetailNode(null)
          setDetailPlayer(null)
        }}
      />

      {branchChoice && (
        <BranchChoiceModal
          options={branchChoice.options}
          currentIndex={branchSelectionIndex}
          onChange={(index) => setBranchSelectionIndex(index)}
          onConfirm={confirmBranchSelection}
          getNodeTitle={(id) => boardNodeMap.get(id)?.title ?? id}
        />
      )}
    </main>
  )
}

export default App
