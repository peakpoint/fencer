export type Side = 'red' | 'blue'

export interface MessageData {
    username: string
    content: string
}

export interface Message extends MessageData {
    side: Side
    key: number
}

export interface Visible {
    red?: true
    blue?: true
}

export interface CellChange {
    row: number
    col: number
    char: string
}

export interface CellBlank {
    status: 'blank'
    owner?: Side
    visible: Visible
    guess: {}
    timeout: {}
    clues: number[]
    actual: string
    index: number
}

export interface CellWall {
    status: 'wall'
    visible: Visible
}

export interface Clue {
    status: string
    dir: "across" | "down"
    index: number
    cells: [number, number][]
    walls: [number, number][]
    visible: Visible
    text: string
}

export interface CrossState {
    id: string
    cells: (CellBlank | CellWall)[][]
    clues: Clue[]
}

export interface Game {
    gameID: string
    state: CrossState
}

export interface GameInternal extends Game {
    redURL: string
    blueURL: string
}

export interface GameSide extends Game {
    side: Side
    username: string
    competitor: string
}


export interface CellProps {
    x: number
    y: number
    type: 'blank' | 'wall' | 'unknown'
    owner?: Side
    answer: string
    index: number
    // across clue
    across?: Clue
    // down clue index
    down?: Clue
}

export interface InternalCellProps {
    value: string
    timeout?: number
    owner?: Side
}

export type CellOnChange = (
    x: number, y: number,
    prev: string, char: string) => void

export type CellOnClick =
    (props: CellProps, e: React.MouseEvent) => void


export interface ClaimData {
    x: number
    y: number
    char: string
}
