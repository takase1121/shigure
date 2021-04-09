import { writeFileSync } from 'fs'
import { Writable } from 'stream'

import { Writer, WritableCb, Command } from '@shigure/base'

export class JsonWriter extends Writable implements Writer {
    protected filename: string
    protected commands: Command[]

    constructor(filename: string) {
        super({ objectMode: true })
        this.filename = filename
        this.commands = []
    }

    _write(chunk: Command, _encoding: string, callback: WritableCb): void {
        this.commands.push(chunk)
        callback()
    }

    _final(callback: (error: Error | null) => void): void {
        try {
            const json = JSON.stringify(this.commands)
            writeFileSync(this.filename, json, { encoding: 'utf-8' })
            callback(null)
        } catch (error) {
            callback(error)
        }
    }
}