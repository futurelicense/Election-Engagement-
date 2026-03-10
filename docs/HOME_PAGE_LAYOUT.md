# Home Page Layout Structure

The **home page** (`/`) is implemented in `src/pages/CountrySelector.tsx`. The global `Header` and chat UI wrap the page via `App.tsx`.

---

## Layout Order

```
1. Header          (global, from App.tsx)
2. Hero
3. News            (flex row – main axis row, 4 columns on large screens)
4. Nigeria Election 2027 poll card
5. National Debate (green section with button)
6. Discussion
7. Footer
8. Global          (FloatingChatButton, ChatWindow – from App.tsx)
```

---

## Section Details

| # | Section | Component / Location | Description |
|---|---------|----------------------|-------------|
| 1 | **Header** | `src/components/Header.tsx` | Sticky nav: logo (→ `/`), Login/Signup or user + Admin + Logout. |
| 2 | **Hero** | `CountrySelector.tsx` | Centered headline, subtext, and vote-count badge. |
| 3 | **News** | `HomeNewsSlider.tsx` | Flex row layout (`flex flex-row flex-wrap`). Tabs: Breaking, Important, General. Article cards with load more. |
| 4 | **Nigeria Election 2027** | `CountrySelector.tsx` | Poll card: Live badge, featured election header, candidate grid with progress bars and Vote buttons. |
| 5 | **National Debate** | `CountrySelector.tsx` | Single green section (bg-african-green/5, border), icon + title + description + “Join the Debate” button. |
| 6 | **Discussion** | `HomeDiscussion.tsx` | Latest comments for election, comment form or login CTA, link to full discussion. |
| 7 | **Footer** | `CountrySelector.tsx` | Single-line copyright. |
| 8 | **Global** | `App.tsx` | FloatingChatButton, ChatWindow. |

---

## Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  1. HEADER                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  2. HERO                                                                     │
│  Headline · Subtext · "+ N Nigerians have voted today"                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  3. NEWS (flex-direction: row)                                              │
│  [ Breaking ] [ Important ] [ General ]   ← 3–4 columns in a row               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  4. NIGERIA ELECTION 2027 POLL CARD                                         │
│  Live badge · Header · Candidate grid + Vote buttons                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  5. NATIONAL DEBATE (green section)                                         │
│  Icon + "National Debate Room" + description + [ Join the Debate ]          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  6. DISCUSSION                                                              │
│  Comments + form / login CTA                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  7. FOOTER                                                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  8. GLOBAL: FloatingChatButton · ChatWindow                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

- **Containers:** `max-w-6xl mx-auto`, padding `px-4 sm:px-6 lg:px-8`.
- **News:** `flex flex-row flex-wrap`; each column `flex-1 min-w-[260px] basis-[260px]`.
- **Poll candidate grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- **National Debate:** `flex-col` on small, `sm:flex-row` for icon+text vs button.

---

## File Reference

| File | Role |
|------|------|
| `src/App.tsx` | Routes `/` → `CountrySelector`, wraps with Header, FloatingChatButton, ChatWindow. |
| `src/pages/CountrySelector.tsx` | Home page: Hero, News, poll card, National Debate section, Discussion, footer. |
| `src/components/Header.tsx` | Global header. |
| `src/components/HomeNewsSlider.tsx` | News section; flex row layout. |
| `src/components/HomeDiscussion.tsx` | Discussion/comments section. |
