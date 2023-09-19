import { NextApiRequest, NextApiResponse } from "next";
// import { gameMap } from "../socket"

// TODO: delete this?

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string }
    // const game = gameMap.get(id)
    
    console.log(`id: ${id}`)

    // if (game) {
    //     res.json({
    //         username:
    //             id == game.redURL ?
    //             game.redUN :
    //             game.blueUN
    //     })
    // } else {
        res.json({ error: "no such game" })
    // }

    // res.end()
}
