## Table of contents

### Type aliases

- [Arguments][1]
- [Context][2]
- [Parser][3]
- [Program][4]

### Functions

- [configureProgram][5]

## Type aliases

### Arguments

Ƭ **Arguments**\<T>: T & { \[argName: string]: _unknown_; `$0`: _string_ ; `_`:
(_string_ | _number_)\[] }

#### Type parameters:

| Name | Default |
| :--- | :------ |
| `T`  | {}      |

Defined in: node_modules/@types/yargs/index.d.ts:641

---

### Context

Ƭ **Context**: _object_

#### Type declaration:

| Name      | Type           |
| :-------- | :------------- |
| `parse`   | [_Parser_][3]  |
| `program` | [_Program_][4] |

Defined in: [src/index.ts:22][6]

---

### Parser

Ƭ **Parser**: (`argv?`: _string_\[]) => _Promise_<[_Arguments_][1]>

#### Type declaration:

▸ (`argv?`: _string_\[]): _Promise_<[_Arguments_][1]>

#### Parameters:

| Name    | Type       |
| :------ | :--------- |
| `argv?` | _string_[] |

**Returns:** _Promise_<[_Arguments_][1]>

Defined in: [src/index.ts:20][7]

---

### Program

Ƭ **Program**: Argv

Defined in: [src/index.ts:18][8]

## Functions

### configureProgram

▸ **configureProgram**(): [_Context_][2]

Create and return a pre-configured Yargs instance (program) and argv parser.

**Returns:** [_Context_][2]

Defined in: [src/index.ts:32][9]

▸ **configureProgram**(`program`: [_Program_][4]): [_Context_][2]

Configure an existing Yargs instance (program) and return an argv parser.

#### Parameters:

| Name      | Type           | Description                   |
| :-------- | :------------- | :---------------------------- |
| `program` | [_Program_][4] | A Yargs instance to configure |

**Returns:** [_Context_][2]

Defined in: [src/index.ts:38][10]

[1]: README.md#arguments
[2]: README.md#context
[3]: README.md#parser
[4]: README.md#program
[5]: README.md#configureprogram
[6]:
  https://github.com/Xunnamius/git-add-then-commit/blob/9d62c54/src/index.ts#L22
[7]:
  https://github.com/Xunnamius/git-add-then-commit/blob/9d62c54/src/index.ts#L20
[8]:
  https://github.com/Xunnamius/git-add-then-commit/blob/9d62c54/src/index.ts#L18
[9]:
  https://github.com/Xunnamius/git-add-then-commit/blob/9d62c54/src/index.ts#L32
[10]:
  https://github.com/Xunnamius/git-add-then-commit/blob/9d62c54/src/index.ts#L38
