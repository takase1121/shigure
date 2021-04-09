declare namespace JsdocParser {
    interface Location {
        offset: number
        line: number
        column: number
    }

    interface SourceLocation {
        start: Location
        end: Location
    }

    interface ASTNode {
        type: string
        dataType?: ASTNode | string
        children?: ASTNode[]
    }

    export class SyntaxError {
        expected: string
        found: string
        location: SourceLocation
    }

    export function parse(str: string): ASTNode
}

export = JsdocParser