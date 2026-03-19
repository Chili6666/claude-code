---
paths:
  - "**/*.{tsx,ts}"
---

# React Rules

---

## Rule 1: No Direct `useEffect` (CRITICAL)

**Action: Auto-fix** — Replace direct `useEffect` calls with the appropriate pattern below. Never write a raw `useEffect` in component or hook code.

Direct `useEffect` is banned. It is the most common source of race conditions, infinite loops, and hard-to-trace bugs. Every use case has a better primitive.

The only place `useEffect` may appear is inside the `useMountEffect` utility hook (see Rule 5).

**Smell tests — if any of these are true, you are about to misuse `useEffect`:**

- You are writing `useEffect(() => setX(deriveFromY(y)), [y])`
- Your effect does `fetch(...)` then `setState(...)`
- State is used as a flag so an effect can fire the real action
- The effect's only job is to reset state when an ID/prop changes

---

## Rule 2: Derive State Inline — Never Sync It

**Action: Auto-fix** — Replace `useEffect`-based state sync with inline derivation.

If a value can be computed from existing state or props, compute it during render. Never store derived data in separate state and sync it via an effect — this adds an extra render cycle and creates loop hazards.

```tsx
// ❌ BAD: Two render cycles — first stale, then filtered
const [products, setProducts] = useState<Product[]>([]);
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

useEffect(() => {
  setFilteredProducts(products.filter((p) => p.inStock));
}, [products]);

// ✅ GOOD: Compute inline in one render
const [products, setProducts] = useState<Product[]>([]);
const filteredProducts = products.filter((p) => p.inStock);
```

```tsx
// ❌ BAD: Effect chain with loop hazard
const [tax, setTax] = useState(0);
const [total, setTotal] = useState(0);

useEffect(() => { setTax(subtotal * 0.1); }, [subtotal]);
useEffect(() => { setTotal(subtotal + tax); }, [subtotal, tax]);

// ✅ GOOD: No effects required
const tax = subtotal * 0.1;
const total = subtotal + tax;
```

---

## Rule 3: Use Event Handlers for User-Triggered Actions

**Action: Auto-fix** — Move side effects from `useEffect` into the event handler that triggers them.

If something happens because a user clicked, typed, or submitted, do the work in the handler. Never set a flag in state and relay it through an effect.

```tsx
// ❌ BAD: Effect as an action relay
const [liked, setLiked] = useState(false);

useEffect(() => {
  if (liked) {
    postLike();
    setLiked(false);
  }
}, [liked]);

return <button onClick={() => setLiked(true)}>Like</button>;

// ✅ GOOD: Direct event-driven action
return <button onClick={() => postLike()}>Like</button>;
```

---

## Rule 4: Use Data-Fetching Hooks — Not `useEffect` + `fetch`

**Action: Flag** — Report `useEffect` calls that contain `fetch`, `supabase.from`, or service calls followed by `setState`.

Effect-based fetching creates race conditions when the dependency changes before the previous request completes. Use a dedicated data-fetching hook or abstract the fetch + loading + error state into a custom hook that manages cleanup internally.

```tsx
// ❌ BAD: Race condition risk — no cancellation
useEffect(() => {
  fetchProduct(productId).then(setProduct);
}, [productId]);

// ✅ GOOD: Custom hook with proper cleanup/abort
const { data: product, loading } = useProduct(productId);
```

When a data-fetching library (React Query, SWR) is not in use, encapsulate the fetch in a custom hook that handles an `AbortController` or a stale-closure guard. The raw `useEffect` + `fetch` + `setState` pattern must never appear in component code.

---

## Rule 5: `useMountEffect` for One-Time External Sync

**Action: Auto-fix** — Replace `useEffect(() => { ... }, [])` with `useMountEffect(() => { ... })`.

For the rare case where you genuinely need to run code once on mount (DOM integration, third-party widget init, browser API subscription), use the `useMountEffect` utility hook. This makes intent explicit and keeps the `useEffect` ban enforceable via lint/search.

```tsx
// The only place useEffect is allowed:
const useMountEffect = (effect: () => void | (() => void)): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};
```

```tsx
// ❌ BAD: Raw useEffect with empty deps
useEffect(() => {
  inputRef.current?.focus();
}, []);

// ✅ GOOD: Named mount hook
useMountEffect(() => {
  inputRef.current?.focus();
});
```

**Valid uses of `useMountEffect`:**

- DOM integration (focus, scroll position, resize observers)
- Third-party widget lifecycle (map init, chart init)
- Browser API subscriptions (event listeners, intersection observers)
- One-time data fetch on page load (when wrapped in a custom hook)

---

## Rule 6: Reset with `key`, Not Dependency Choreography

**Action: Auto-fix** — Replace effects that reset state on ID/prop change with the `key` remount pattern.

If a component needs to "start fresh" when an identifier changes, use React's `key` prop to force a clean remount instead of writing an effect that manually resets state.

```tsx
// ❌ BAD: Effect resets state when videoId changes
const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  useMountEffect(() => {
    loadVideo(videoId);
  });

  useEffect(() => {
    loadVideo(videoId);
  }, [videoId]);
};

// ✅ GOOD: key forces clean remount — component always sees fresh props
const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  useMountEffect(() => {
    loadVideo(videoId);
  });
};

// Parent:
<VideoPlayer key={videoId} videoId={videoId} />
```

**Smell test:**

- The effect's only job is to reset local state when an ID or prop changes
- You want the component to behave like a brand-new instance for each entity

---

## Rule 7: Conditional Mounting Over Guard Clauses in Effects

**Action: Flag** — Report effects that contain early-return guards based on props or state.

Instead of guarding inside an effect (`if (!ready) return`), move the precondition to the parent and mount the child only when ready. Children can then assume preconditions are met, leading to simpler components.

```tsx
// ❌ BAD: Guard inside effect
const VideoPlayer = ({ isLoading }: { isLoading: boolean }) => {
  useEffect(() => {
    if (!isLoading) playVideo();
  }, [isLoading]);
};

// ✅ GOOD: Mount only when preconditions are met
const VideoPlayerWrapper = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) return <LoadingScreen />;
  return <VideoPlayer />;
};

const VideoPlayer = () => {
  useMountEffect(() => playVideo());
};
```
