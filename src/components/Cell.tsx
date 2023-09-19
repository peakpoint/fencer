import { useEffect, useState } from "react";
import { CellOnClick, CellProps, InternalCellProps } from "@/lib/types";

export default function Cell({ cell, iCell, onClick, focused, highlight }: {
    cell: CellProps
    iCell: InternalCellProps
    onClick: CellOnClick
    focused: boolean
    highlight: boolean
}) {
    const [time, setTime] = useState(performance.now());
    const timeout = iCell.timeout || 0

    useEffect(() => {
        const id = setInterval(() => {
            if (time > timeout)
                clearInterval(id);
            else
                setTime(performance.now());
        }, 10);

        return () => clearInterval(id);
    }, [timeout, time]);

    const rad = 30;

    const owner = cell.owner ?? iCell.owner

    const arc = (1 - (timeout - time) / 3000) * Math.PI * 2;
    const timedout = 0 <= arc && time <= timeout;

    return (
        <td onClick={e => onClick(cell, e)}
            className={`
                relative
                w-12
                p-0
                ${cell.type == 'unknown' ? ' bg-neutral-700' :
                    cell.type == 'wall' ? 'bg-neutral-900' :
                    owner == 'red' ? 'bg-red-400' :
                    owner == 'blue' ? 'bg-blue-400' :
                    // focused ? 'bg-yellow-300' :
                    // highlight ? 'bg-yellow-100' :
                    'bg-white'}
            `}
        >
            <div className={`
                border
                border-black
                aspect-square
                flex
                justify-center
                items-center
                text-black
                text-2xl
                ${
                    cell.type != 'blank' ? '' :
                    focused ? 'bg-yellow-400/60' :
                    highlight ? 'bg-yellow-200/40' : ''}
                ${ timedout ? 'bg-rlg' : ''}
            `}>
                {timedout ?
                    <svg viewBox={`-50 -50 100 100`}>
                        <path className="fill-neutral-600" d={`
                            M 0 0
                            L 0 -${rad}
                            A ${rad} ${rad} 0 ${arc < Math.PI ? 0 : 1} 1
                            ${Math.sin(arc) * rad}
                            ${-Math.cos(arc) * rad}`} />
                    </svg>
                    :
                owner ? cell.answer : iCell.value}
            </div>
            {(cell.type == 'wall' || cell.index == 0) ||
                <sup className="
                    absolute
                    top-[1vh]
                    left-[0.3vh]
                    text-neutral-700
                    text-[1vh]">
                    {cell.index}
                </sup>}
        </td>);
}
