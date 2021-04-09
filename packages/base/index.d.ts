export interface TypeNode {
    type: string
    dataType?: TypeNode | string
    children?: TypeNode[]
}

export interface Argument {
    name: string
    type: TypeNode
    description?: string
    optional: boolean
    rest?: boolean
}

export interface Command {
    name: string
    arguments?: Argument[]
    description?: string
    aliases?: string[]
    examples?: string[]
}

export type TransformCb = (error?: Error, data?: never) => void
export interface Reader {
    _transform(filename: string, encoding: string, cb: TransformCb): void
}

export type WritableCb = (error?: Error) => void
export interface Writer {
    _write(chunk: Command, encoding: string, callback: WritableCb): void
}