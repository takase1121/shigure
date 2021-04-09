import { Transform } from 'stream'

type TransformCb = (error?: Error | null, data?: never) => void

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