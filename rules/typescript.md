---
paths:
  - "**/*.{ts,tsx}"
---

# TypeScript Code Quality Rules

---

## Rule 1: Import Ordering

**Action: Auto-fix** — Reorder imports automatically without prompting. No need to report unless asked.

Imports must be organized into six named groups, separated by blank lines with section comments.

**Groups (in order):**

1. `// React` — React and React-related framework imports
2. `// Third-party` — External npm packages (non-React)
3. `// Local: Interfaces/Types` — Local `interface`, `type`, or `*.types.ts` imports
4. `// Local: Utilities/Services` — Local helpers, hooks, services, constants
5. `// Local: Components` — Local React component imports
6. `// Local: Other` — Anything that doesn't fit the above (e.g. CSS modules, assets)

**Rules:**

- Each group is preceded by its section comment and followed by a blank line
- Within each group, sort alphabetically by module specifier
- Omit empty groups entirely (no comment, no blank line)
- Omit all section comments when only one group exists in the file
- Combine duplicate module imports into a single statement
- Use single quotes for all import paths

**Correct:**
```ts
// React
import React, { useEffect, useState } from 'react';

// Third-party
import classNames from 'classnames';

// Local: Interfaces/Types
import type { Chat } from '../../interfaces/Chat';
import type { User } from '../../interfaces/User';

// Local: Utilities/Services
import { formatDate } from '../../utils/dateUtils';

// Local: Components
import { Avatar } from '../Avatar/Avatar';
import { ChatMessage } from '../ChatMessage/ChatMessage';

// Local: Other
import styles from './ChatContent.module.css';
```

**Incorrect:**
```ts
import styles from './ChatContent.module.css';  // ❌ CSS before components
import React from 'react';
import { Avatar } from '../Avatar/Avatar';
import type { Chat } from '../../interfaces/Chat';
import classNames from 'classnames';             // ❌ unsorted within group
import type { User } from '../../interfaces/User';
```

---

## Rule 2: Memoization — Flag Only Clear Anti-Patterns

**Action: Flag** — Report violations with the anti-pattern name and line number. Do not silently remove or restructure memoization.

Only flag memoization that is **obviously wrong**. Do not speculate about performance or downstream usage. If a pattern does not clearly match one of the five anti-patterns below, classify it as **"Correct"** or **"Review"** — never flag speculatively.

**The five clear anti-patterns:**

1. **Trivial computation in `useMemo`** — arithmetic, string concatenation, ternary, or single property access. These have negligible cost and don't benefit from memoization.

   ```ts
   // ❌ Trivial — no memoization needed
   const label = useMemo(() => `Hello, ${name}!`, [name]);

   // ✅ Correct
   const label = `Hello, ${name}!`;
   ```

2. **Service/singleton lookup in `useMemo`** — wrapping a `.get()` or `.resolve()` call on a stable provider whose reference doesn't change.

   ```ts
   // ❌ Unnecessary — provider.get() is already stable
   const service = useMemo(() => provider.get(ChatService), [provider]);

   // ✅ Correct
   const service = provider.get(ChatService);
   ```

3. **`useCallback` with no memoized child consumer** — handler passed only to a native HTML element or a non-`React.memo` component. The callback is recreated on every parent render regardless.

   ```ts
   // ❌ Unnecessary — onClick on a <button> doesn't benefit from useCallback
   const handleClick = useCallback(() => setOpen(true), []);

   // ✅ Correct
   const handleClick = () => setOpen(true);
   ```

4. **`React.memo` with unstable props** — the wrapped component always receives inline objects, arrays, or arrow functions from its parent, defeating shallow comparison.

   ```ts
   // ❌ React.memo is useless — style and onClick are recreated every render
   <MemoizedCard style={{ color: 'red' }} onClick={() => doThing(id)} />
   ```

5. **`useMemo` with empty deps `[]` for static values** — a value that never changes should be declared outside the component or in a `useRef`, not memoized.

   ```ts
   // ❌ Static value — doesn't belong inside the component
   const CATEGORIES = useMemo(() => ['a', 'b', 'c'], []);

   // ✅ Correct — declare outside the component
   const CATEGORIES = ['a', 'b', 'c'];
   ```

---

## Rule 3: JSDoc on All Interfaces and Their Properties

**Action: Auto-fix** — Add missing JSDoc automatically without prompting.

Every `interface` declaration must have:

- A **block JSDoc comment** (`/** ... */`) above the interface describing its purpose
- An **inline JSDoc comment** (`/** ... */`) on every property describing what it holds

**Style** (matches existing interfaces in `src/interfaces/`):

```ts
/**
 * Represents a user in the chat system.
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Display name shown in the UI */
  displayName: string;
  /** Whether this user is a bot */
  isBot?: boolean;
}
```

**Rules:**

- Descriptions are concise and written in present tense
- Optional properties (`?`) are documented the same as required ones
- Union type properties describe valid values in plain language (e.g. `'online' | 'offline'` → `"User's current presence status"`)
- No `@param` or `@returns` tags are needed on properties — inline doc only
- The interface-level JSDoc uses the multi-line `/** ... */` block form
- Property JSDoc uses the single-line `/** ... */` inline form on the same line as the property

**Incorrect:**
```ts
// ❌ Missing interface JSDoc, missing property docs
export interface Message {
  id: string;
  content: string;
  senderId: string;
}

// ❌ Using // line comments instead of /** */ JSDoc
export interface Message {
  // Unique message ID
  id: string;
}
```

---

## Rule 4: Arrow Functions (CRITICAL)

**Action: Auto-fix** — Replace `function` keyword declarations with arrow functions automatically.

Never use the `function` keyword for function declarations. Always use arrow functions. Exception: `constructor()` is a language requirement and cannot be replaced.

```ts
// ✅ Correct
const processData = (items: Item[]): Item[] => {
  return items.filter(i => i.active);
};

// ❌ Incorrect
function processData(items: Item[]): Item[] {
  return items.filter(i => i.active);
}
```

---

## Rule 5: No Unused Variables or Parameters (CRITICAL)

**Action: Flag** — Report the variable name and line number.

All declared or destructured variables must be used. If a parameter is required by an interface or signature but not used in the implementation, prefix it with `_` (see Rule 13).

```ts
// ❌ Incorrect — tokens is extracted but never used
const tokens = this.extract(spec);
return this.build();

// ✅ Correct
const tokens = this.extract(spec);
return this.build(tokens);
```

---

## Rule 6: File Naming Matches Export (CRITICAL)

**Action: Flag** — Report mismatched filename and exported name.

The filename must exactly match the primary exported entity. Classes and exported interfaces use PascalCase filenames. Utility function files use kebab-case filenames.

```
// ✅ Correct
UserService.ts  →  export class UserService { ... }
file-utils.ts   →  export const readFile = ...

// ❌ Incorrect
userservice.ts  →  export class UserService { ... }
FileUtils.ts    →  export const readFile = ...
```

---

## Rule 7: One Exported Entity Per File (CRITICAL)

**Action: Flag** — Report when multiple exported entities exist in a single file.

Each file exports exactly one thing: one class, one interface, or one group of related functions. Private (non-exported) types or interfaces used only within that file may remain in the same file.

```ts
// ❌ Incorrect — single file exporting both a class and an interface
// UserService.ts
export interface CreateUserData { name: string; email: string; }
export class UserService { ... }

// ✅ Correct
// User.ts         → export interface User { ... }
// UserService.ts  → export class UserService { ... }
```

---

## Rule 8: No Mixed Exports (CRITICAL)

**Action: Flag** — Report files that mix exported interfaces with exported classes or exported functions.

A file must not mix exported interfaces with exported classes, or exported interfaces with exported functions. Move any mixed exported interface to its own file.

```ts
// ❌ Incorrect — prompts.ts mixes an exported interface with exported functions
export interface SelectOption { value: string; label: string; }
export const promptSelect = (options: SelectOption[]): Promise<string> => { ... };

// ✅ Correct
// interfaces/SelectOption.ts  →  export interface SelectOption { ... }
// utils/prompts.ts             →  export const promptSelect = ...
```

---

## Rule 9: Explicit Access Modifiers (HIGH)

**Action: Auto-fix** — Add missing access modifiers automatically.

All class members (fields and methods) must have an explicit `public`, `private`, or `protected` modifier. Never leave a member implicitly public.

```ts
// ✅ Correct
private readonly users: User[] = [];
public constructor() {}
public findUser = (id: string): User | undefined => {
  return this.users.find(u => u.id === id);
};

// ❌ Incorrect
users: User[] = [];
constructor() {}
findUser(id: string): User | undefined {
  return this.users.find(u => u.id === id);
}
```

---

## Rule 10: Class Member Order (HIGH)

**Action: Flag** — Report out-of-order members with the expected order.

Members must appear in this sequence: private fields → constructor → public methods → protected methods → private methods.

```ts
// ✅ Correct
class UserService {
  private readonly db: Database;          // 1. private fields

  public constructor(db: Database) { ... } // 2. constructor

  public findUser = (id: string): User => { ... }; // 3. public methods

  protected validate = (user: User): boolean => { ... }; // 4. protected methods

  private buildQuery = (id: string): string => { ... }; // 5. private methods
}

// ❌ Incorrect — constructor before private fields, private method before public
class UserService {
  public constructor(db: Database) { ... }
  private readonly db: Database;
  private buildQuery = (id: string): string => { ... };
  public findUser = (id: string): User => { ... };
}
```

---

## Rule 11: JSDoc for Public Functions and Methods (HIGH)

**Action: Auto-fix** — Add missing JSDoc blocks automatically.

All public functions and class methods must have a JSDoc block comment. Include `@param` for each parameter, `@returns` for the return value, and `@throws` when the function can throw.

```ts
// ✅ Correct
/**
 * Finds a user by their unique identifier.
 * @param id - The unique user identifier
 * @returns The user if found, undefined otherwise
 */
public findUser = (id: string): User | undefined => {
  return this.users.find(u => u.id === id);
};

// ❌ Incorrect — no JSDoc
public findUser = (id: string): User | undefined => {
  return this.users.find(u => u.id === id);
};
```

---

## Rule 12: Type Safety — No `any`, Explicit Return Types (MEDIUM)

**Action: Flag** — Report `any` usage and missing return types on public functions.

Avoid `any`; use specific types or `unknown` when the shape is truly unknown. All public functions must declare an explicit return type annotation.

```ts
// ✅ Correct
const process = (data: unknown): string[] => {
  return (data as string[]).filter(Boolean);
};

// ❌ Incorrect — any type, no return type annotation
const process = (data: any): any => {
  return data.filter(Boolean);
};

// ❌ Incorrect — missing return type on public function
const getUsers = (filter: string) => {
  return this.users.filter(u => u.name.includes(filter));
};
```

---

## Rule 13: `_` Prefix for Intentionally Unused Parameters (MEDIUM)

**Action: Flag** — Report `_`-prefixed variables that are actually extracting values that should be passed through.

Parameters required by an interface or signature but genuinely unused in the implementation must be prefixed with `_`. This signals intent, not oversight. Do not use `_` to hide a variable that carries a value needed downstream.

```ts
// ✅ Correct — interface requires the parameter but this implementation ignores it
public generate = (_variant?: string): Result => {
  return this.defaultResult;
};

// ❌ Incorrect — _tokens extracts a value that should be passed to build()
private build = (_tokens: Record<string, unknown>): string => {
  return 'hardcoded';
};
```

---

## Rule 14: Dependency Injection (MEDIUM)

**Action: Flag** — Report `new` instantiation of dependencies inside class bodies.

Classes must receive their dependencies via the constructor, not instantiate them internally. This ensures testability and loose coupling.

```ts
// ✅ Correct
public constructor(
  private readonly db: Database,
  private readonly logger: Logger,
) {}

// ❌ Incorrect — internal instantiation couples the class to concrete implementations
private db = new Database();
private logger = new Logger();
```

---

## Rule 15: Type-Safe Custom Error Classes (MEDIUM)

**Action: Flag** — Report `throw new Error(...)` where a typed custom error class should be used.

Throw typed custom error classes rather than generic `Error`. Custom error classes must extend `Error` and set `this.name` in the constructor.

```ts
// ✅ Correct
class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
throw new ValidationError('Invalid email format');

// ❌ Incorrect
throw new Error('Invalid email format');
```

---

## Rule 16: File Organization — Public API First (MEDIUM)

**Action: Auto-fix** — Reorder file contents to put exported functions before private helpers.

In files with exported functions, order content as: imports → private types → exported functions → private helpers. Public API must appear before implementation details.

```ts
// ✅ Correct
import { User } from '../interfaces/User';

type InternalCache = Map<string, User>;

export const findUser = (id: string): User | undefined => {
  return buildCache().get(id);
};

const buildCache = (): InternalCache => {
  // private helper — appears after the export
  return new Map();
};

// ❌ Incorrect — private helper before exported function
const buildCache = (): InternalCache => { ... };

export const findUser = (id: string): User | undefined => { ... };
```

---

## Rule 17: Interface Organization (MEDIUM)

**Action: Flag** — Report single-use interfaces that are exported, or shared interfaces that live inline in non-interface files.

Single-use interfaces (referenced only within one file) must be private (non-exported) and stay in that file. Shared interfaces (referenced by multiple files) must live in separate files under `interfaces/`, one interface per file.

```ts
// ✅ Correct — shared interface in its own file
// interfaces/User.ts
export interface User { id: string; name: string; }

// ✅ Correct — single-use interface is private, stays in the same file
// UserService.ts
interface CreateUserData { name: string; email: string; }  // not exported

// ❌ Incorrect — single-use interface exported from a non-interface file
// UserService.ts
export interface CreateUserData { name: string; email: string; }
```

---

## Rule 18: No Magic Numbers or Strings (LOW)

**Action: Flag** — Report inline numeric or string literals that carry semantic meaning.

Extract meaningful literals into named constants declared above the function or at module scope. Simple values like `0`, `1`, `''`, or `true` used as defaults are exempt.

```ts
// ✅ Correct
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_PATH = '/api/v1';

for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
  await fetch(API_BASE_PATH + '/users');
}

// ❌ Incorrect
for (let i = 0; i < 3; i++) {
  await fetch('/api/v1/users');
}
```

---

## Rule 19: Performance Anti-Patterns (LOW)

**Action: Flag** — Report chained array operations that can be collapsed and object/array lookups inside tight loops.

- Avoid expensive operations (DOM access, object construction, function calls with side effects) inside loops
- Prefer a single-pass `reduce` over chained `.filter().filter().map()`
- Use `Map` or `Set` instead of plain objects for frequent key-based lookups

```ts
// ✅ Correct — single pass, no intermediate arrays
const activeValues = items.reduce<number[]>((acc, item) => {
  if (item.active && item.value > 0) acc.push(transform(item));
  return acc;
}, []);

// ✅ Correct — O(1) lookup with Map
const userMap = new Map(users.map(u => [u.id, u]));
const found = userMap.get(targetId);

// ❌ Incorrect — three passes, two intermediate arrays
const activeValues = items
  .filter(x => x.active)
  .filter(x => x.value > 0)
  .map(x => transform(x));

// ❌ Incorrect — O(n) lookup repeated inside loop
for (const id of ids) {
  const user = users.find(u => u.id === id);
}
```
