import { TypeNode } from '@shigure/base'

const map: { [key: string]: string } = {
    'UNION_START': '(',
    'UNION_SEP': '|',
    'UNION_END': ')',
    'ARRAY_END': '[]'
}

const unionStart = { type: 'UNION_START' }
const unionSep = { type: 'UNION_SEP' }
const unionEnd = { type: 'UNION_END' }
const arrayEnd = { type: 'ARRAY_END' } 

function forEachReverse<T>(array: T[], fn: (element: T, index?: number) => unknown): void {
    for (let i = array.length - 1; i >= 0; i--)
        fn(array[i], i)
}

export function stringifyAST(node: TypeNode): string {
    const stack = [node]
    const output = []

    while (stack.length > 0) {
        const item = stack.pop() as TypeNode

        switch (item.type) {
        case 'UNION':
            stack.push(unionEnd)
            forEachReverse(item.children as TypeNode[], c => stack.push(c, unionSep))
            stack.pop() // remove trailing seperator
            stack.push(unionStart)
            break
        case 'ARRAY':
            stack.push(arrayEnd)
            stack.push(item.dataType as TypeNode)
            break
        default:
            output.push(map[item.type] ?? (item.dataType as string))
        }
    }

    return output.join('')
}