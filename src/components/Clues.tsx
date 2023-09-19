import { FocusedClue } from "@/lib/client_types"
import { Clue } from "@/lib/types"

export default function Clues({
    title, clues,
    focusedClue,
    onClick
}: {
    title: string
    clues: Clue[]
    focusedClue: FocusedClue
    onClick: (c: Clue) => void
}) {
    return <>
        <div className="overflow-y-auto w-72">
            <h3>{title}</h3>
            {clues.map(c => {
                const same = focusedClue.index == c.index
                    && focusedClue.dir == c.dir
                return (
                    <div className={`
                        ${same ?
                            'bg-yellow-200/40' : ''}
                        ${same ?
                            'hover:bg-yellow-200/60' :
                            'hover:bg-yellow-200/20'}
                        `}
                        key={c.index + c.dir}
                        onClick={() => onClick(c)}
                    >
                        {c.index}: {c.text}
                    </div>)
            })}
        </div>
    </>
}