import { Readable, Transform } from 'stream'
import { join } from 'path'
import {
    readdirSync,
    lstatSync
} from 'fs'

import pumpCb from 'pump'

type Matcher = (str: string) => boolean
export type TransformCb = (error?: Error, data?: unknown) => void
export class GlobMatcher extends Transform {
    protected match: Matcher[]
    protected except: Matcher[]
    constructor(match: Matcher[], except : Matcher[]) {
        super({ objectMode: true })
        this.match = match
        this.except = except
    }

    _transform(filename: string, _encoding: string, callback: TransformCb): void {
        try {
            if (this.match.some(glob => glob(filename))
                && !this.except.some(glob => glob(filename)))
                this.push(filename)
            callback()
        } catch (error) {
            callback(error)
        }
    }
}

export class Walkdir extends Readable {
    protected stack: string[]
    constructor(path: string) {
        super({ objectMode: true })
        this.stack = [path]
    }

    _read(): void {
        for (let i = 0; i < 100; i++) {
            const path = this.stack.pop()
            if (!path) {
                this.push(null)
                break
            }
            
            try {
                const pathInfo = lstatSync(path)
                if (pathInfo.isDirectory())
                    readdirSync(path)
                        .map(d => join(path, d))
                        .forEach(d => this.stack.push(d))
                else
                    this.push(path)
            } catch (error) {
                this.destroy(error)
            } 
        }
    }
}

export function pump(...stream: never[]): Promise<void> {
    return new Promise((resolve, reject) => {
        pumpCb(
            ...stream,
            (error?: Error) => error ? reject(error) : resolve()
        )
    })
}

const state = ['|', '/', '-', '\\']
export class Progress extends Transform {
    protected i: number
    protected state: number
    protected queue: string[]
    protected loop?: NodeJS.Timeout
    protected destroyCb?: () => void

    constructor() {
        super({ objectMode: true })

        this.i = 0
        this.state = 0
        this.queue = ['???']
        if (process.stderr.isTTY) {
            this.reportTTY()
        }
    }

    reportTTY(): void {
        const filename = this.queue?.shift()

        if (filename) {
            const text = `${state[this.state]}\tProcessing: ${filename}`

            process.stderr.cursorTo(0)
            process.stderr.clearLine(1)
            process.stderr.write(text)
    
            this.state++
            if (this.state > 3) this.state = 0
        }

        if (!this.destroyCb || this.queue.length > 0)
            this.loop = setTimeout(() => this.reportTTY(), 150)
        else
            this.destroyCb()
    }

    reportFallback(filename: string): void {
        console.error(`${++this.i}: Processing: ${filename}`)
    }

    _transform(filename: string, _encoding: string, callback: TransformCb): void {
        if (process.stderr.isTTY)
            this.queue.push(filename)
        else
            this.reportFallback(filename)
        this.push(filename)
        callback()
    }

    _destroy(error: Error | null, callback: (error: Error | null) => void): void {
        this.destroyCb = () => callback(error) // wait for queue to be emptied
    }
}
