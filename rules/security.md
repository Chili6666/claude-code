---
paths:
  - "**/*.{ts,tsx,js,jsx}"
---

# Security Rules

---

## Rule 1: Never Hardcode Secrets or Credentials

Never embed API keys, tokens, passwords, or other secrets directly in source files. Use environment variables or runtime config instead.

**Why:** Hardcoded secrets end up in version control, bundle artifacts, and browser dev tools. Even "private" repos have been leaked. Use `.env` files (gitignored) or server-side config injection.

**References:**
- [OWASP A02:2021 – Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
- [OWASP Top 10 Proactive Controls: C8 – Protect Data Everywhere](https://owasp.org/www-project-proactive-controls/)

---

## Rule 2: Avoid `dangerouslySetInnerHTML` with Untrusted Content

Do not use `dangerouslySetInnerHTML` with any value that originates from user input, API responses, or external data sources. If HTML rendering is absolutely required, sanitize with a trusted library first.

**Do:**
```tsx
// ✅ Render plain text — React escapes automatically
<p>{message.content}</p>

// ✅ If HTML is truly required, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
```

**Don't:**
```tsx
// ❌ Renders raw HTML from API — XSS risk
<div dangerouslySetInnerHTML={{ __html: apiResponse.body }} />

// ❌ Never use unsanitized user input
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Why:** Injected HTML can contain `<script>` tags or inline event handlers that execute in the user's browser. React's default JSX escaping is the first line of defense — bypass it only when unavoidable and always sanitize first.

**References:**
- [OWASP A03:2021 – Injection (XSS)](https://owasp.org/Top10/A03_2021-Injection/)
- [React Docs: dangerouslySetInnerHTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html)

---

## Rule 3: Use Secure Storage for Sensitive Client-Side State

When persisting sensitive data client-side, use `sessionStorage` scoped to the session rather than `localStorage`. Never store auth tokens client-side — use HttpOnly cookies set by the server.

**Why:** `localStorage` persists across browser sessions and is readable by any JavaScript on the page — including third-party scripts and XSS payloads. `sessionStorage` is slightly better but still readable by scripts. Only HttpOnly cookies are inaccessible to JavaScript.

**References:**
- [OWASP A07:2021 – Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/)
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

---

## Rule 4: Validate and Sanitize All User Input at Boundaries

Validate and sanitize all input that crosses a trust boundary: user-typed content, URL parameters, query strings, and file uploads. Never pass raw user input directly to APIs, `eval`, or DOM APIs.

**Do:**
```ts
// ✅ Trim, length-check, and validate before use
const sanitized = userInput.trim().slice(0, 4000);
if (!sanitized) return;
await api.post('/messages', { content: sanitized });

// ✅ Validate URL parameters before use
const id = new URLSearchParams(location.search).get('id');
if (!id || !/^[\w-]+$/.test(id)) return;
```

**Don't:**
```ts
// ❌ Raw user input sent directly to API
await api.post('/messages', { content: e.target.value });

// ❌ eval() with any user-controlled string — never acceptable
eval(userInput);

// ❌ Constructing URLs with raw input from untrusted sources
fetch(`/api/users/${userId}/data`); // if userId comes from untrusted input
```

**Why:** Unvalidated input is the root cause of injection attacks. Even in frontend-only code, unvalidated data can be passed to backend APIs, third-party SDKs, or URL constructs that later become server-side vulnerabilities.

**References:**
- [OWASP A03:2021 – Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

---

## Rule 5: Never Use Dynamic `import()` with User-Controlled Paths

Do not use dynamic `import()` or `require()` with paths derived from user input, URL parameters, or external API responses. All dynamic module paths must be static or come from a developer-controlled allowlist.

**Do:**
```ts
// ✅ Static import path
const { FeatureComponent } = await import('./features/FeatureA');

// ✅ Allowlist-based dynamic loading
const ALLOWED_PLUGINS = ['chart', 'table', 'form'] as const;
type PluginName = typeof ALLOWED_PLUGINS[number];
if (ALLOWED_PLUGINS.includes(pluginName as PluginName)) {
  const mod = await import(`./plugins/${pluginName}`);
}
```

**Don't:**
```ts
// ❌ User-controlled dynamic import — path traversal risk
const mod = await import(userInput);

// ❌ Route param used directly in import path
const plugin = searchParams.get('plugin');
const mod = await import(`./plugins/${plugin}`);
```

**Why:** Dynamic imports with unvalidated paths can load arbitrary modules, potentially enabling path traversal, supply chain attacks, or loading unintended code from the build artifact. In Vite/webpack, this also breaks static analysis and tree-shaking.

**References:**
- [OWASP A08:2021 – Software and Data Integrity Failures](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/)
- [OWASP Top 10 for Agentic Applications 2026 – ASI04: Agentic Supply Chain Vulnerabilities](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)

---

## Rule 6: Apply Least Privilege to External Integrations and API Calls

Only pass the minimum data required when calling external APIs, third-party services, or integration points. Never forward full application state, raw auth tokens, or user PII to external services unless explicitly required.

**Do:**
```ts
// ✅ Pass only the fields the external service needs
await analyticsService.track('message_sent', {
  chatType: chat.type,
  messageLength: content.length,
  // No user ID, no message content, no tokens
});

// ✅ Scope API calls to the minimum required permissions
const response = await api.get(`/chats/${chatId}/messages`, {
  headers: { Authorization: `Bearer ${readOnlyToken}` },
});
```

**Don't:**
```ts
// ❌ Forwarding full user object to analytics — includes tokens and PII
analyticsService.track('page_view', { user: currentUser });

// ❌ Sending more data than the API needs
await thirdPartyService.call({ ...appState }); // entire app state
```

**Why:** Oversharing data with external services expands the blast radius of any breach — at that service or in transit. Minimize what you expose by default. This is a direct application of the principle of least privilege.

**References:**
- [OWASP A01:2021 – Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [OWASP Top 10 for Agentic Applications 2026 – ASI08: Excessive Agency / Scope Creep](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
- [OWASP Top 10 Proactive Controls: C3 – Secure Database Access](https://owasp.org/www-project-proactive-controls/)
