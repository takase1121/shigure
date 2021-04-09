#!/usr/bin/env node

import { join } from 'path'

import mri from 'mri'
import picomatch from 'picomatch'

import { Reader, Writer } from '@shigure/base'
import { GlobMatcher, Progress, Walkdir, pump } from './util'

interface Options {
    reader: Reader
    writer: Writer
    include: string[]
    exclude: string[]
}

function usage() {
    console.error(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        `usage: ${require('../package.json').name} [-ch]\n\n` + 
        '\t--help, -h\tShows this message\n' +
        '\t--config, -c\tConfig file path\n'
    )
}

function arg() {
    const args = mri(process.argv.slice(2), {
        boolean: 'help',
        string: 'config',
        alias: {
            help: 'h',
            config: 'c'
        }
    })
    return {
        help: args.help,
        config: args.config,
        _: args._
    }
}

async function main() {
    Error.stackTraceLimit = 2
    const args = arg()
    
    if (!args.config || args.help) {
        usage()
        process.exit(1)
    }

    const configFile = join(process.cwd(), args.config as string)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config: Options = require(configFile)

    config.include.push(...args._)
    const includePath = config.include
        .map(glob => picomatch.scan(glob, {}))
        .map(scan => (scan as { base: string })?.base)
    const includeGlob = config.include
        .map(glob => picomatch(glob))
    const excludeGlob = config.exclude
        .map(glob => picomatch(glob))

    const matcher = new GlobMatcher(includeGlob, excludeGlob)
    const jobs = includePath.map(path =>
        pump(new Walkdir(path) as never,
            new Progress() as never,
            matcher as never,
            config.reader as never,
            config.writer as never))

    await Promise.all(jobs)
}

let keepAlive: NodeJS.Timeout
function wait() {
    keepAlive = setTimeout(wait, 1000)
}

main()
    .catch(console.error)
    .finally(() => clearTimeout(keepAlive))

// wait for main thread
wait()