Type
  = Array
  / Union
  / Primitive

Union
  = '(' _ first:Type others:(_ '|' _ Type)* _ ')' {
  	return {
      type: 'UNION',
      children: [first, ...others.map(tok => tok[3])]
    }
  }

Array
  = type:(Union / Primitive) "[]" {
  	return {
    	type: 'ARRAY',
      dataType: type
    }
  }

Primitive
	= token:("string" / "number" / "User" / "Channel" / "Role") {
    return {
      type: 'PRIMITIVE',
      dataType: token
    }
  }

_ "whitespace"
  = [ \t\n\r]*