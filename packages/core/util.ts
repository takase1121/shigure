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
