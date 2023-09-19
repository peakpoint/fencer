import { MutableRefObject, useImperativeHandle, useRef, useState } from "react"
import { CellOnChange, CellOnClick, CellProps, Clue, CrossState, InternalCellProps, Side } from "@/lib/types"
import { useImmer } from "use-immer"
import Cell from "./Cell"
import Clues from "./Clues"
import { Dir, FocusedClue } from "@/lib/client_types"

// function toData(state: CrossState, side: Side) {
//     const data: GridData = {
//         across: {},
//         down: {}
//     }

//     for (let clue of state.clues) {
//         if (clue.visible[side]) {
//             data[clue.dir][clue.index] = {
//                 clue: clue.text,
//                 answer: clue.cells.map(([x, y]) => {
//                     let cell = state.cells[x][y]

//                     if (cell.status != 'wall') {
//                         return cell.actual
//                     } else {
//                         return ''
//                     }
//                 }).join(''),
//                 row: clue.cells[0][0],
//                 col: clue.cells[0][1]
//             }
//         }
//     }

//     return data
// }

// just gonna assume 15 x 15
function toCells(state: CrossState, side: Side) {
    const cells: CellProps[][] = Array(15).fill(0).map((_, x) => {
        return Array(15).fill(0).map((_, y) => ({
            x, y,
            type: 'unknown',
            value: '',
            answer: '',
            index: 0
        }))
    })

    // for (let i in data.across) {
    //     let { row, col, answer } = data.across[i]
    //     const clueIndex = Number(i)
    //     cells[row][col].index = clueIndex
        
    //     for (let c of answer) {
    //         cells[row][col].type = 'blank'
            
    //         const s = state.cells[row][col]
    //         if (s.status != 'wall') cells[row][col].owner = s.owner
            
            
    //         cells[row][col].answer = c
    //         cells[row][col].across = clueIndex
    //         col++
    //     }
    // }

    // for (let i in data.down) {
    //     let { row, col, answer } = data.down[i]
    //     const clueIndex = Number(i)
    //     cells[row][col].index = clueIndex
        
    //     for (let c of answer) {
    //         cells[row][col].type = 'blank'

    //         const s = state.cells[row][col]
    //         if (s.status != 'wall') cells[row][col].owner = s.owner

    //         cells[row][col].answer = c
    //         cells[row][col].down = clueIndex
    //         row++
    //     }
    // }
    // console.log(state.cells)
    for (let i in state.cells) {
        const x = Number(i)

        for (let j in state.cells[x]) {
            const y = Number(j)
            
            const cell = state.cells[x][y]
            if (!cell.visible[side]) continue

            cells[x][y].type = cell.status
            
            if (cell.status != 'wall') {
                cells[x][y].answer = cell.actual
                cells[x][y].owner = cell.owner
            }
        }
    }

    for (let clue of state.clues) {
        if (!clue.visible[side]) continue

        for (let [x, y] of clue.cells) {
            cells[x][y][clue.dir] = clue
        }

        const [x, y] = clue.cells[0]
        cells[x][y].index = clue.index
    }

    return cells
}

function toClues(clues: Clue[], dir: string, side: Side): Clue[] {
    return clues.filter(c => c.dir == dir && c.visible[side])
}

type Focus = { x: number, y: number }

function op(d: Dir): Dir {
    return d == 'across' ? 'down' : 'across'
}

type Focused = {x: number, y: number}

function fromClue(c: Clue): FocusedClue {
    return { index: c.index, dir: c.dir }
}

type GridRef = MutableRefObject<HTMLTableElement | null>

function Grid({ cells, side,
    focused, setFocused,
    focusedClue, setFocusedClue,
    clues,
    onChange,
    gridRef
}: {
    cells: CellProps[][]
    side: Side
    focused: Focused
    setFocused: any
    focusedClue: FocusedClue,
    setFocusedClue: any,
    onChange: CellOnChange
    clues: Clue[],
    gridRef: GridRef
}) {
    // internal cell data
    const [iCells, setICells] = useImmer<InternalCellProps[][]>(
        cells.map(r => r.map(() => ({
            value: ''
        })))
    )

    const { index: clueIndex, dir } = focusedClue
    
    // const cellsRef: MutableRefObject<HTMLTableSectionElement | null> = useRef(null)

    function focusValid(f: Focus) {
        return 0 <= f.x && f.x < cells.length && 0 <= f.y && f.y < cells.length
    }

    function setSquareFocused(
        x: number, y: number,
        d: Dir = dir
    ) {
        if (focusValid({x, y}) && cells[x][y].type == 'blank') {
            setFocused({x, y})

            // set clue index to highlight squares
            const cell = cells[x][y]
            let c = cell[d]
            if (c) {
                setFocusedClue(fromClue(c))
                return
            }

            d = op(d)
            c = cell[d]
            if (c) {
                setFocusedClue(fromClue(c))
            }
        }
    }

    const onClick: CellOnClick = (cell, e) => {
        if (cell.x == focused.x && cell.y == focused.y) {
            setSquareFocused(cell.x, cell.y, op(dir))
        }
        else setSquareFocused(cell.x, cell.y)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (!focusValid(focused)) return

        if (e.key.match(/Arrow/)) e.preventDefault()

        switch (e.key) {
            case 'Tab': {
                e.preventDefault()
                setSquareFocused(focused.x, focused.y, op(dir))
                return
            }
            case 'ArrowLeft':
                setSquareFocused(focused.x, focused.y - 1, 'across')
                return
            case 'ArrowRight':
                setSquareFocused(focused.x, focused.y + 1, 'across')
                return
            case 'ArrowUp':
                setSquareFocused(focused.x - 1, focused.y, 'down')
                return
            case 'ArrowDown':
                setSquareFocused(focused.x + 1, focused.y, 'down')
                return
        }

        if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) return
        
        // change content
        const cell = cells[focused.x][focused.y]
        const iCell = iCells[focused.x][focused.y]
        
        if (cell.owner) return
        if ((iCell.timeout || 0) > performance.now()) return

        if (e.key.match(/^[a-z]$/)) {
            const newChar = e.key.toUpperCase()
            
            // wrong letter
            if (cell.answer != newChar) {
                setICells(c => {
                    c[focused.x][focused.y].value = ''
                    c[focused.x][focused.y].timeout = performance.now() + 3000
                })

                return
            }

            // right letter
            onChange(focused.x, focused.y,
                iCells[focused.x][focused.y].value, newChar)

            setICells(c => {
                c[focused.x][focused.y].value = newChar
                c[focused.x][focused.y].owner = side
            })

            // move focused square
            if (dir == 'across')
                setSquareFocused(focused.x, focused.y + 1)
            else
                setSquareFocused(focused.x + 1, focused.y)
            
        } else if (e.key == 'Backspace' || e.key == 'Delete') {
            setICells(c => {
                c[focused.x][focused.y].value = ''
            })
        }
    }

    return <table
        ref={gridRef}
        tabIndex={0}
        className="table-fixed select-none"
        onKeyDown={onKeyDown}
    >
    <tbody>
        {cells.map((row, x) => <tr key={x}>
            {row.map(cell =>
                <Cell cell={cell}
                iCell={iCells[cell.x][cell.y]}
                key={`${cell.x}-${cell.y}`}
                onClick={onClick}
                focused={focused.x == cell.x && focused.y == cell.y}
                highlight={
                    cell[dir]?.index == clueIndex &&
                    cell[dir]?.dir == dir
                }
                />)}
            </tr>)}
    </tbody>
    </table>
}

export default function Cross({ state, side, onChange }: {
    state: CrossState
    side: Side
    onChange?: CellOnChange
}) {
    const cells = toCells(state, side)
    const { clues } = state
    
    const gridRef: GridRef = useRef(null)

    const [focused, setFocused] = useState<Focus>({x: 0, y: 0})
    const [focusedClue, setFocusedClue] =
        useImmer<FocusedClue>({ index: 0, dir: 'across' })

    function onClick(c: Clue) {
        setFocusedClue({ index: c.index, dir: c.dir })
        const [x, y] = c.cells[0]
        setFocused({x, y})

        gridRef.current?.focus()
    }

    return (<div className="flex flex-row gap-8 pb-10">
        <Clues title="ACROSS"
            clues={toClues(clues, 'across', side)}
            focusedClue={focusedClue}
            onClick={onClick}/>
        <Clues title="DOWN"
            clues={toClues(clues, 'down', side)}
            focusedClue={focusedClue}
            onClick={onClick}/>
        <Grid cells={cells} side={side}
            clues={clues}
            focused={focused}
            setFocused={setFocused}
            focusedClue={focusedClue}
            setFocusedClue={setFocusedClue}
            onChange={onChange || (() => {})}
            gridRef={gridRef} />
    </div>)
}