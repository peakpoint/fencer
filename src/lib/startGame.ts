import { CrossState } from "./types";
import fs from 'fs/promises'

export async function startGame() {
    /* 
        In practice, you'd have a way of generating
        crossword puzzles on the go
    */

    const files = await fs.readdir('data')
    const file = files[0]

    console.log(files)

    const state = JSON.parse(await fs.readFile(`data/${file}`, {
        encoding: 'utf8'
    })) as CrossState

    return state
}