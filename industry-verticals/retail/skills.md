# Skill: Fixing React hydration issues (Next.js + Sitecore XM Cloud)

Generic playbook for **any** component in this repository (`src/components/**`, shared helpers, and client UI that SSRs). Use when the console shows **“Hydration failed”**, **“server rendered HTML didn’t match the client”**, or **“server rendered text didn’t match the client.”**

---

## 1. What hydration is (one sentence)

React expects the **first client render** of a component tree to match the **HTML that came from the server**. Any difference in **tag name**, **attributes**, **text nodes**, or **child structure** can trigger a hydration error.

---

## 2. Sitecore-specific root cause (most important)

Branches like `page.mode.isEditing ? <Text /> : plainString` are fragile because **`isEditing` can disagree between SSR and the first client paint** when using:

- XM Cloud Pages / embedded editor shells  
- Sitecore field chrome (`FieldMetadata`, `contenteditable`, CKEditor wrappers)  
- SDK components that render **different DOM** in “editing” vs “preview” mode  

**Symptoms in the React diff:**

- Server: `<span contenteditable="false" style={{ cursor: "text", … }}>`  
- Client: plain text `{"Your copy"}`  
- Server: Next/Image (`data-nimg`, `tabindex`) — Client: native `<img>`  
- Server: CKEditor / `RichText` — Client: `<div dangerouslySetInnerHTML>`  
- Server: `style={{ cursor: "pointer" }}` on wrappers — Client: without it  

**Fix pattern (this repo):** use `useHydrationSafeEditing()` from `@/hooks/useHydrationSafeEditing`. It returns `mounted && page.mode.isEditing`, so **SSR and the first client pass both use the static branch**; after mount, the editor branch can run in Pages.

Apply it anywhere you previously used `page.mode.isEditing` **only to choose between** SDK field components vs plain HTML/strings.

**Keep `useSitecore()`** when you still need `page` for non-editing data (for example `page.layout.sitecore.route`).

---

## 3. Images (`Next/Image` vs native `<img>`)

Sitecore’s `NextImage` / `Image` often produces markup that **differs between server and client** (sizes, `data-nimg`, lazy flags).

**Pattern:** `SitecoreOrNativeImage` in `@/helpers/sitecoreHydrationSafe.tsx` — SDK image **only when** `isEditing` is true (after hydration-safe editing is active), **native `<img>`** for normal browsing. Pass **`isEditing` from `useHydrationSafeEditing()`** when branching.

---

## 4. Invalid HTML nesting

Putting **block-level** or **editor wrappers** inside **phrasing-only** parents (`<h1>`, `<p>`, inline `<span>`) can make the **browser repair the DOM** so it no longer matches React’s virtual tree.

**Patterns:**

- Inside `<h1>`–`<h6>`: prefer **`Text tag="span"`** + `className="text-inherit"` for editable titles; keep heading semantics on the `<h*>` itself.  
- Do not leave **`Text`** (default block wrappers) **inside `<p>`** without an explicit safe `tag`.  
- Move **decorative siblings** (e.g. SVG flourishes below a title) **outside** the heading element if the browser repairs the tree and React disagrees.

---

## 5. Conditional media that changes the element type (`<video>` vs `<img>`, etc.)

If a boolean (field presence, URL, feature flag) can **differ between SSR and the first client render**, you may render **`<video>` on one pass and `<img>` on the other** (or swap any two incompatible roots).

**Pattern:** gate the “richer” or **client-dependent** branch on **`useState` + `useEffect`** (e.g. `mediaReady`) so **SSR and hydration always take the same branch**, then switch after mount if needed. Applies to **any** component under `src/components/`, not one specific screen.

---

## 6. CMS HTML (`dangerouslySetInnerHTML`)

Rich text strings can be **normalized differently** (whitespace, entities). `suppressHydrationWarning` on the **wrapper** may **silence warnings** but does not fix logic bugs; use **after** you are sure `isEditing` is not flipping incorrectly.

Prefer fixing **`isEditing` consistency** first.

---

## 7. Debugging workflow

1. Read the **full** React message: it shows **minus = server DOM** vs **plus = client expectation** (or the reverse depending on React version; focus on **what differs**).  
2. If you see **`FieldMetadata`**, **`contenteditable`**, **`ck-`**, **`data-nimg`**: suspect **`isEditing` / SDK vs static** first.  
3. Confirm whether the problem appears **only in XM Cloud Pages** or also on **published** static delivery.  
4. Search the codebase for **`page.mode.isEditing`** — any **render branch** should use **`useHydrationSafeEditing()`** unless you have a documented exception.  
5. Temporarily test in an **incognito** window **without extensions** to rule out DOM-mutating plugins (rare but real).

---

## 8. What is usually *not* your app’s hydration bug

- Apollo `InMemoryCache` / `addTypename` warnings from the **host shell**  
- **404** on `authoring/api/...` from the **editor** talking to wrong environment  
- **Browser userscripts** (e.g. CDP/Engage)  
- **Mixed content** / **HMR** noise  

Treat those separately; fixing a **single** component file rarely resolves shell, network, or extension issues.

---

## 9. Quick checklist for new or updated components

- [ ] Avoid `Date.now()`, `Math.random()`, `typeof window !== 'undefined'` in render for **initial** UI.  
- [ ] Use **`useHydrationSafeEditing()`** for Sitecore **edit vs static** branches.  
- [ ] Use **`SitecoreOrNativeImage`** (or equivalent) for **non-editing** images.  
- [ ] Keep **valid** heading/paragraph structure; use **`tag="span"`** on `Text` where needed.  
- [ ] Defer **client-only** branches (video, third-party widgets) until **after mount** if they change the **element type** or **major subtree**.  
- [ ] Run **`npx tsc --noEmit`** after refactors.

---

## 10. Shared utilities in this repo

| Piece | Location |
|--------|----------|
| Deferred editing flag (`mounted && page.mode.isEditing`) | `src/hooks/useHydrationSafeEditing.ts` |
| Plain text / rich HTML / SDK-vs-native image helpers | `src/helpers/sitecoreHydrationSafe.tsx` |

Import these from **any** component that follows the patterns above. When adding a new Sitecore-driven component, start from the same patterns so behavior stays consistent across the codebase.
