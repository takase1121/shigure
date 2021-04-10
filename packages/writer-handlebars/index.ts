import { Writable } from 'stream'
import { writeFileSync } from 'fs'

import Handlebars from 'handlebars'
import { Writer, WritableCb, Command, TypeNode } from '@shigure/base'

import { stringifyAST } from './util'

export interface HandlebarsOptions {
    indexPath: string
    commandPath: string
    filePerCommand: boolean
    indexTemplate: string
    commandTemplate: string
}

interface HasIndex {
    index: HandlebarsTemplateDelegate
    indexFile: HandlebarsTemplateDelegate
}

interface HasCommand {
    command: HandlebarsTemplateDelegate
    commandFile: HandlebarsTemplateDelegate
}

function assertTemplate(
    template: string | undefined,
    templateName: string,
    path?: string
): asserts template is string {
    if ((path && typeof path === 'string')
        && (!template || typeof template !== 'string'))
        throw new Error(`a template is not provided for "${templateName}"`)
}

export class HandlebarsWriter extends Writable implements Writer {
    protected perCommand: boolean
    
    index?: HandlebarsTemplateDelegate
    indexFile?: HandlebarsTemplateDelegate
    command?: HandlebarsTemplateDelegate
    commandFile?: HandlebarsTemplateDelegate

    protected commands: Command[]
    constructor(options: Partial<HandlebarsOptions>) {
        super({ objectMode: true })
        
        assertTemplate(options.indexTemplate, 'index', options.indexPath)
        assertTemplate(options.commandTemplate, 'command', options.commandPath)
        
        Handlebars.registerHelper('jsdoctype', (type: TypeNode) => stringifyAST(type))
        const handlebarsOptions = {
            knownHelpers: {
                'jsdoctype': true
            },
            knownHelpersOnly: true
        }

        this.perCommand = options.filePerCommand ?? true
        this.commands = []
        if (options.indexPath) {
            this.index = Handlebars.compile(options.indexTemplate, handlebarsOptions)
            this.indexFile = Handlebars.compile(options.indexPath, handlebarsOptions)
        }
        if (options.commandPath) {
            this.command = Handlebars.compile(options.commandTemplate, handlebarsOptions),
            this.commandFile = Handlebars.compile(options.commandPath, handlebarsOptions)
        }
    }

    canWriteCommands(): this is HasCommand {
        return this.commandFile !== undefined
    }

    canWriteIndex(): this is HasIndex {
        return this.indexFile !== undefined
    }

    _write(command: Command, _encoding: string, callback: WritableCb): void {
        this.commands.push(command)
        callback()
    }

    _final(callback: WritableCb): void {
        try {
            if (this.canWriteCommands()) {
                if (this.perCommand) {
                    for (const command of this.commands) {
                        const context = { command }
                        const filename = this.commandFile(context)
                        const content = this.command(context)
                        writeFileSync(filename, content, { encoding: 'utf-8' })
                    }
                } else {
                    const context = { commands: this.commands }
                    const filename = this.commandFile(context)
                    const content = this.command(context)
                    writeFileSync(filename, content, { encoding: 'utf-8' })
                }
            }
            
            if (this.canWriteIndex()) {
                const context = { commands: this.commands }
                const filename = this.indexFile(context)
                const content = this.index(context)
                writeFileSync(filename, content, { encoding: 'utf-8' })
            }
            callback()
        } catch (error) {
            callback(error)
        }
    }
}