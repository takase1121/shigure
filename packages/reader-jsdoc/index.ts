import { readFileSync } from 'fs'
import { Transform } from 'stream'
import { Block, Spec, parse } from 'comment-parser'

import { parse as jsdocParse } from './jsdoctype'

import { Reader, TypeNode, TransformCb } from '@shigure/base'

function filterTag(type: string) {
    return (block: Block): Spec[] =>
        block.tags.filter(({ tag }) => tag === type)
}
const commandTags = filterTag('command')
const argumentTags = filterTag('param')
const aliasTags = filterTag('alias')
const exampleTags = filterTag('example')

function parseType(type: string) {
    let rest = false
    if (type.startsWith('...')) {
        rest = true
        type = type.slice(3)
    }

    return {
        type: jsdocParse(type) as TypeNode,
        rest
    }
}

const populateAliases = (comment: Block) =>
    aliasTags(comment)
        .reduce((arr, alias) => {
            if (alias.name)
                arr.push(alias.name)
            alias.description.split(/\s+/g)
                .filter(token => token.length > 0)
                .forEach(token => arr.push(token))
            return arr
        }, [] as string[])

const populateArguments = (comment: Block) =>
    argumentTags(comment)
        .map(({ name, type, description, optional }) => ({
            name: name,
            type: parseType(type).type,
            description: description,
            rest: parseType(type).rest,
            optional
        }))

const populateExamples = (comment: Block) =>
    exampleTags(comment)
        .map(({ source }) =>
            source.slice(1).map(s => s.tokens.description).join('\n'))

            
const populateCommand = (comment: Block) => ({
    name: commandTags(comment).pop()?.name ?? '',
    arguments: populateArguments(comment),
    description: comment.description,
    aliases: populateAliases(comment),
    examples: populateExamples(comment)
})

const isCommand = (comment: Block) => commandTags(comment).length !== 0
            
export class JsdocReader extends Transform implements Reader {
    constructor() {
        super({ objectMode: true })
    }

    _transform(filename: string, _encoding: string, cb: TransformCb): void {
        try {
            const file = readFileSync(filename, { encoding: 'utf-8' })
            const tree = parse(file)

            tree.filter(isCommand)
                .map(populateCommand)
                .forEach(command => this.push(command))
            cb()
        } catch (error) {
            cb(error)
        }
    }
}