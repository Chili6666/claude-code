---
name: check-memoization
description: Scan React components for unnecessary useMemo, useCallback, and React.memo usage
version: 1.0.0
type: command
---

# Check Memoization Command

Systematically scan the project for unnecessary memoization (`useMemo`, `useCallback`, `React.memo`) and report findings directly in the chat.

**No report files, no metrics, no TODOs** - results are displayed inline only.

## Workflow

### Step 1: Precondition Check

Verify this is a React project:

1. Use Glob to check for `.tsx` files in `src/`
2. Use Read to verify `package.json` contains a `react` dependency

If either check fails, inform the user: "This does not appear to be a React project. Aborting."

### Step 2: Find All Memoization Usage

Use Grep to search `src/` for all occurrences of:

- `useMemo(`
- `useCallback(`
- `React.memo(`

Collect file path, line number, and surrounding context (5 lines before and after each match).

### Step 3: Analyze Each Occurrence

For each found occurrence, read the full file and analyze the memoization against these anti-patterns:

#### Anti-Pattern 1: Trivial Computation in `useMemo`

**Detect**: `useMemo` wrapping simple expressions like arithmetic, string concatenation, ternaries, or single property access.

```tsx
// UNNECESSARY
const doubled = useMemo(() => count * 2, [count]);
const label = useMemo(() => `Hello ${name}`, [name]);
const classes = useMemo(() => isDark ? 'dark' : 'light', [isDark]);
```

**Recommendation**: Compute directly - these are O(1) operations that don't benefit from caching.

#### Anti-Pattern 2: Service / Singleton Lookup in `useMemo`

**Detect**: `useMemo` wrapping a `.get()`, `.resolve()`, or similar service-locator call where the provider reference is stable.

```tsx
// UNNECESSARY
const service = useMemo(() => {
  return provider.get<MyService>('MyService');
}, [provider]);
```

**Recommendation**: Assign directly with `const service = provider?.get<MyService>('MyService')`. Service providers typically return the same singleton instance.

#### Anti-Pattern 3: `useCallback` Without Memoized Child Consumer

**Detect**: `useCallback` for event handlers passed only to native HTML elements (`<button>`, `<input>`, `<div>`, etc.) or components that are NOT wrapped in `React.memo`.

```tsx
// UNNECESSARY
const handleClick = useCallback(() => { doSomething(); }, []);
return <button onClick={handleClick}>Click</button>;
```

**Recommendation**: Use a plain function. Native elements don't benefit from stable references.

#### Anti-Pattern 4: `React.memo` With Unstable Props

**Detect**: `React.memo(Component)` where the parent passes inline objects, arrays, or arrow functions as props.

```tsx
// UNNECESSARY - parent always passes new objects
export default React.memo(MyComponent);
// Parent: <MyComponent style={{ color: 'red' }} onChange={() => {}} />
```

**Recommendation**: Either remove `React.memo` or stabilize props in the parent.

#### Anti-Pattern 5: Empty/Static Dependencies in `useMemo`

**Detect**: `useMemo(() => ..., [])` with empty dependency array for one-time computations.

```tsx
// UNNECESSARY
const config = useMemo(() => ({ theme: 'dark', lang: 'en' }), []);
```

**Recommendation**: Move outside the component or compute directly if the value is truly static. Use `useRef` if you need a stable object reference created once.

### Step 4: Classify and Report

For each occurrence, classify as one of:

- **Unnecessary** - Matches an anti-pattern, should be simplified
- **Correct** - Memoization provides genuine value (expensive computation, stable reference for memoized children, etc.)
- **Review** - Cannot determine automatically, manual review recommended

### Step 5: Present Results

Output the results directly in chat using this format:

```
## Memoization Check Results

### <filename>

**Line <N>**: `useMemo` / `useCallback` / `React.memo`
- **Category**: Unnecessary / Correct / Review
- **Reason**: <Brief explanation>
- **Suggestion**: <Recommended change, if Unnecessary>

---
```

Group findings by file. At the end, provide a summary:

```
### Summary
- Total: X memoization instances found
- Unnecessary: X (should be simplified)
- Correct: X (genuine optimization)
- Review: X (needs manual check)
```

If any findings are marked "Unnecessary", ask:
"Would you like me to remove the unnecessary memoization instances?"

Wait for user confirmation before making any code changes.
