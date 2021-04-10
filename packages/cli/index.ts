#!/usr/bin/env node

import { join } from 'path'

import mri from 'mri'

import { run, Options } from '@shigure/core'
import { Progress } from './util'


function usage() {
    console.error(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        `usage: ${require('../package.json').name} [-ch] [FILES...]\n\n` +
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
    config.pipeline = [new Progress(), ...config.pipeline]

    await run(config)
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