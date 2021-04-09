#!/usr/bin/env node

import picomatch from 'picomatch'

import { GlobMatcher, Walkdir, pump } from './util'
import { Stream } from 'stream'

export interface Options {
    pipeline: Stream[]
    include: string[]
    exclude: string[]
}

export async function run(config: Options): Promise<void> {
    Error.stackTraceLimit = 2
    
    const includePath = config.include
        .map(glob => picomatch.scan(glob, {}))
        .map(scan => (scan as { base: string })?.base)
    const includeGlob = config.include
        .map(glob => picomatch(glob))
    const excludeGlob = config.exclude
        .map(glob => picomatch(glob))

    const jobs = includePath.map(path =>
        pump(new Walkdir(path) as never,
            new GlobMatcher(includeGlob, excludeGlob) as never,
            ...config.pipeline as never[]))

    await Promise.all(jobs)
}