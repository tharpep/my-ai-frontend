# 🎨 AI Frontend App - UX/UI Redesign Plan

**Design Philosophy**: Clean Workspace + Platform/Dashboard approach
**Strategy**: Full redesign with incremental implementation, UX-first before backend integration
**Layout Pattern**: Minimal header, full-width content, no permanent sidebars

---

## 🎯 Design Goals

1. **Unified Layout System** - Every page uses the same shell, creating a cohesive app experience
2. **Flat Navigation** - Reduce from 3 levels to 2 levels maximum
3. **Platform Equality** - All features (Chat, Documents, Sessions, Tools) are treated as equal-priority workflows
4. **Maximum Viewport** - Reclaim vertical space, especially in chat
5. **Persistent Context** - Always show what model/RAG/session is active
6. **Clean & Modern** - Minimal chrome, focus on content

---

## 📐 Core Layout System

### Global Shell (All Pages)

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Chat] [Documents] [Sessions] [Tools ▼] [⚙] [👤] │  ← 48px compact header
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              Full-width page content                    │
│              (max-width varies by page type)            │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Model: llama3.2 | RAG: Enabled (3 docs) | Session: ... │  ← 32px status bar
└─────────────────────────────────────────────────────────┘
```

**Key Principles:**
- Header is always 48px, compact and clean
- Content area is full-height with consistent padding
- Optional status bar shows global context (32px footer)
- No permanent sidebars - use slide-over drawers when needed
- Same shell for all pages = consistent UX

---

## 🧭 Navigation Restructure

### Current Problems

```
❌ Current: 3 levels, confusing groupings
Header → Dropdown (Tools/Insights/Config) → Page

Issues:
- "Tools" groups unrelated features (Playground, RAG Visualizer, Agents)
- "Insights" is a weak grouping (Sessions aren't really "insights")
- "Config" mixes prompts, settings, dev tools
- Users don't know where to find things
```

### New Structure: 2 Levels, Clear Hierarchy

**Primary Navigation (Always Visible in Header)**

| Nav Item | Type | Purpose |
|----------|------|---------|
| **Chat** | Direct link | Main chat interface - go to current/new conversation |
| **Documents** | Direct link | Upload, manage, search RAG documents |
| **Sessions** | Direct link | Browse all conversation history (lean list) |
| **Tools ▼** | Dropdown | Analysis & testing features |
| **Settings** | Icon button | App configuration (model, RAG, API keys) |
| **Profile** | Icon button | User menu (prompts library, theme, dev tools) |

**Tools Dropdown (Secondary Nav)**
- Playground - Compare models/prompts side-by-side
- RAG Visualizer - Monitor RAG performance
- Agents - Pre-configured AI assistants
- Analytics - Usage metrics and insights

**Profile Dropdown (Utility Nav)**
- Prompts Library - Saved system prompts
- Theme - Light/Dark/System toggle
- Dev Tools - Developer utilities (hidden in prod)

**Rationale:**
- Chat/Documents/Sessions are **primary workflows** → direct access
- Playground/RAG/Agents are **analysis tools** → logical grouping
- Settings/Profile are **utility** → icon buttons save space
- Maximum 2 clicks to reach any page

---

## 📱 Page-by-Page Redesign

### 1. Chat Page - Maximum Viewport for Conversations

**Current Problems:**
- 56px top bar with just hamburger + session name (wasted space)
- 72px input area (too tall for single-line input)
- Sidebar pushes content aside (takes 264px when open)
- No quick actions (new chat, etc.)

**New Design:**

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Chat] [Documents] [Sessions] [Tools ▼] [⚙] [👤] │  ← Global header
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  [+ New Chat]    [☰ History]            │  ← Floating actions (top-right)
│                                                         │
│         ┌─────────────────────────────┐                 │
│         │                             │                 │
│         │  Message bubbles            │                 │
│         │  (centered, max-w-3xl)      │                 │  ← Messages fill height
│         │                             │                 │
│         │                             │                 │
│         └─────────────────────────────┘                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [📎] Type your message...                  [Send] │  │  ← Minimal floating input
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ Model: llama3.2 | RAG: Enabled | Session: "Planning"   │  ← Status bar
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- ✅ Remove dedicated chat header (use global header)
- ✅ Floating "+ New Chat" button (top-right, always accessible)
- ✅ Session list as slide-over drawer (not push sidebar)
- ✅ Messages start near top, fill full height
- ✅ Input is minimal, compact (~48px not 72px)
- ✅ Status bar shows model/RAG context
- ✅ No model picker in chat (stays in Settings)

**Session List Drawer:**
- Click "☰ History" button → drawer slides over from left
- 320px wide with backdrop blur
- Shows session list with hover actions (delete, ingest)
- Click outside or X to close
- Content doesn't shift (overlay, not push)

---

### 2. Documents Page - Search-First, Compact Upload

**Current Problems:**
- Huge upload dropzone takes 1/4 of screen
- No prominent search
- Grid layout is sparse
- No integration with chat
- Dead-end page

**New Design:**

```
┌─────────────────────────────────────────────────────────┐
│ [Global Header]                                         │
├─────────────────────────────────────────────────────────┤
│ Documents                                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔍 Search documents by name, content, or tags...    │ │  ← Prominent search
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [+ Upload] [↗ From URL]          View: [List] [Grid]   │  ← Compact actions
│                                                         │
│ Recent Documents                                        │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 📄 Product_Requirements.pdf     Modified 2h ago  │   │  ← Denser cards
│ │ 1.2 MB • 45 pages • Ingested ✓                   │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 📝 Meeting_Notes.md            Modified yesterday │   │
│ │ 24 KB • 12 chunks • Ingested ✓                   │   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ 📊 Analytics_Report.xlsx        Modified 3d ago   │   │
│ │ 892 KB • Not ingested ○                          │   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
│ [Load More]                                             │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- ✅ Prominent search bar at top
- ✅ Compact upload button (not giant dropzone)
- ✅ Denser document cards with metadata
- ✅ List/Grid view toggle
- ✅ Clear ingestion status
- ✅ Future: @mention integration in chat (backend needed)

---

### 3. Sessions Page - Lean Conversation Browser

**Current Problems:**
- Redundant with sidebar session list
- Not clear what value it adds

**New Design (Keep It Lean):**

```
┌─────────────────────────────────────────────────────────┐
│ [Global Header]                                         │
├─────────────────────────────────────────────────────────┤
│ Chat History                                            │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔍 Search conversations...                          │ │  ← Simple search
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Product Planning Discussion                      │   │
│ │ 24 messages • 2 hours ago                        │   │  ← Clean list items
│ │ "Let's discuss the roadmap for Q2..."           │   │
│ │                                           [Delete]│   │
│ └──────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Debug Authentication Issue                       │   │
│ │ 18 messages • Yesterday                          │   │
│ │ "I'm getting a 401 error when..."               │   │
│ │                                           [Delete]│   │
│ └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- ✅ Simple search bar
- ✅ Clean list with preview text
- ✅ Message count + timestamp
- ✅ Delete action per session
- ✅ Click to open in Chat page
- ❌ No heavy analytics/filtering/export (keep it lean)

**Purpose:** Dedicated page for browsing all conversations with search, while sidebar drawer is for quick session switching during active chat.

---

### 4. Settings Page - Tabbed Interface

**Current Problems:**
- 500+ lines of endless scrolling form
- AI Provider, RAG Config, Library, Journal, Chunking all stacked
- Overwhelming, hard to navigate
- No way to test settings

**New Design:**

```
┌─────────────────────────────────────────────────────────┐
│ [Global Header]                                         │
├─────────────────────────────────────────────────────────┤
│ Settings                                                │
│                                                         │
│ [General] [AI & Models] [RAG & Context] [Advanced]     │  ← Tab navigation
│    ▔▔▔▔▔▔▔▔▔ Active tab                                 │
│                                                         │
│ AI Provider & Models                                    │
│                                                         │
│ Provider                                                │
│ ┌─────────────────────────────────────┐                │
│ │ Ollama ▼                            │                │
│ └─────────────────────────────────────┘                │
│                                                         │
│ Model                                                   │
│ ┌─────────────────────────────────────┐                │
│ │ llama3.2 ▼                          │                │
│ └─────────────────────────────────────┘                │
│                                                         │
│ Temperature                            0.7              │
│ ┌───────────────•─────────────────────┐                │
│ │                                     │                │
│ └─────────────────────────────────────┘                │
│ More creative ←                  → More focused        │
│                                                         │
│ Max Tokens                            4096              │
│ ┌─────────────────────────────────────┐                │
│ │ 4096                                │                │
│ └─────────────────────────────────────┘                │
│                                                         │
│                              [Reset to Defaults] [Save] │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tab Breakdown:**

**General Tab:**
- App preferences
- Theme settings (already has toggle, maybe default here)
- Language, timezone

**AI & Models Tab:**
- Provider (Ollama, OpenAI, Anthropic, etc.)
- Model selection
- Temperature, max tokens, top_p
- System prompt (global default)

**RAG & Context Tab:**
- RAG Configuration (enabled/disabled, strategy)
- Library settings (path, indexing)
- Journal settings (path, chunking)
- Chunking parameters (chunk size, overlap)
- Journal chunking (separate params)

**Advanced Tab:**
- API keys status/management
- Dev mode toggle
- Advanced parameters
- Export/Import settings

**Changes:**
- ✅ Tabbed interface (not endless scroll)
- ✅ Grouped related settings
- ✅ Better visual hierarchy
- ✅ Inline help text for complex fields
- ✅ Reset to defaults option
- ✅ Clear Save action
- ✅ Model selection stays here (not on chat page)

---

### 5. Playground - Stays Separate, Better Integrated

**Current Problems:**
- Mock data, not connected to real backend
- Can't import from Prompts Library
- Can't save results to session

**New Design (Keep Separate Page, Improve Integration):**

```
┌─────────────────────────────────────────────────────────┐
│ [Global Header]                                         │
├─────────────────────────────────────────────────────────┤
│ Model Playground                                        │
│                                                         │
│ Prompt                                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Enter your test prompt...                           │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ [📋 Load from Prompts Library]                          │
│                                                         │
│ Models to Compare                                       │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ ☑ GPT-4             │ │ ☑ Claude Sonnet     │        │
│ │ ☑ llama3.2          │ │ ☐ Gemini Pro        │        │
│ └─────────────────────┘ └─────────────────────┘        │
│                                                         │
│                                          [Run Comparison]│
│                                                         │
│ Results                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐        │
│ │ GPT-4               │ │ Claude Sonnet       │        │
│ │ Response time: 1.2s │ │ Response time: 0.8s │        │
│ │ ─────────────────── │ │ ─────────────────── │        │
│ │ [Response text...]  │ │ [Response text...]  │        │
│ └─────────────────────┘ └─────────────────────┘        │
│                                                         │
│ [Save to Session]                                       │
└─────────────────────────────────────────────────────────┘
```

**Changes:**
- ✅ Keep as separate page (not chat mode)
- ✅ Add "Load from Prompts Library" integration
- ✅ Add "Save to Session" action (future)
- ✅ Use real backend when available
- ✅ Clear layout with side-by-side comparison

---

### 6. Other Pages (Minor Updates)

**RAG Visualizer:**
- Keep current design (it's functional)
- Ensure uses same global shell (header + optional status bar)

**Analytics:**
- Keep dashboard approach
- Use same global shell
- Consider mini-widgets on other pages (future)

**Prompts Library:**
- Keep cards layout with search/filter
- Add "Use in Playground" quick action
- Add "Set as Default" option

**Agents:**
- Keep grid layout with category filter
- Add "Start Chat with Agent" action

**Dev Tools:**
- Keep minimal for now
- Hide in production (environment check)

---

## 🎨 Visual Design System

### Layout Shell Component

Every page uses this consistent shell:

```tsx
<div className="min-h-screen flex flex-col">
  {/* Global Header - 48px */}
  <AppHeader />

  {/* Main Content - flex-1 fills remaining height */}
  <main className="flex-1 flex flex-col">
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      {/* Page-specific content */}
      <PageContent />
    </div>
  </main>

  {/* Optional Status Bar - 32px */}
  {showStatusBar && <StatusBar />}
</div>
```

### Spacing & Sizing Standards

**Fixed Heights:**
- Header: `48px` (h-12)
- Status Bar: `32px` (h-8)
- Chat Input: `48px` minimum (auto-resize up to 200px)
- Page Title: `40px` (text-2xl with margin)

**Padding:**
- Page content: `p-6` (24px) on desktop, `p-4` (16px) on mobile
- Cards: `p-4` (16px) standard, `p-6` (24px) for feature cards
- Sections: `space-y-6` (24px) between major sections

**Max Widths:**
- Chat messages: `max-w-3xl` (768px) - optimal reading width
- Settings/Forms: `max-w-4xl` (896px) - comfortable form width
- Full-width pages: `max-w-7xl` (1280px) - dashboard/grid layouts

### Color Palette (Dark-First)

**Base Colors:**
```css
--background: #0a0a0a (dark) / #ffffff (light)
--foreground: #ededed (dark) / #171717 (light)
```

**Neutrals (Zinc Scale):**
- Surface: `bg-zinc-900` / `bg-zinc-50`
- Borders: `border-zinc-800` / `border-zinc-200`
- Text primary: `text-zinc-100` / `text-zinc-900`
- Text secondary: `text-zinc-400` / `text-zinc-600`

**Accents:**
- Primary: Blue (`blue-600`, `blue-500`, `blue-400`)
- Success: Green (`green-600`, `green-500`)
- Warning: Orange (`orange-600`, `orange-500`)
- Error: Red (`red-600`, `red-500`)
- Info: Purple (`purple-600`, `purple-500`)

### Component Patterns

**Card Pattern:**
```tsx
className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
```

**Input Pattern:**
```tsx
className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100
           focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
           transition-all outline-none"
```

**Button Pattern:**
```tsx
// Primary
className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700
           disabled:opacity-50 disabled:cursor-not-allowed transition-colors"

// Secondary
className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-zinc-700
           border border-zinc-700 transition-colors"

// Ghost
className="rounded-lg px-4 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800
           transition-colors"
```

**List Item Hover:**
```tsx
className="group p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"

// With hidden actions
<button className="opacity-0 group-hover:opacity-100 transition-opacity">
  Delete
</button>
```

---

## 🔧 Components to Build/Update

### New Components

1. **`<StatusBar />`** - Global context footer
   - Shows current model, RAG status, session name
   - 32px height, dark background
   - Conditionally rendered

2. **`<SlideOverDrawer />`** - Reusable drawer component
   - Overlay with backdrop blur
   - Slide animation from left/right
   - Click outside to close
   - Used for session list, future mobile menu

3. **`<FloatingActionButton />`** - FAB for "+ New Chat"
   - Fixed position top-right
   - Circular or rounded pill
   - Drop shadow for elevation

4. **`<TabNavigation />`** - For Settings page
   - Horizontal tabs with active state
   - Accessible (keyboard nav, ARIA)
   - Responsive (scrollable on mobile)

### Components to Update

1. **`<AppHeader />`** - Redesign navigation
   - Flatten to 2 levels
   - New groupings (Chat, Documents, Sessions, Tools ▼)
   - Icon buttons for Settings/Profile
   - Responsive (collapse to hamburger on mobile)

2. **`<ChatInterface />`** - Major overhaul
   - Remove top bar
   - Remove push sidebar
   - Add floating "+ New Chat" button
   - Add "☰ History" button
   - Minimal input design

3. **`<ChatSidebar />`** - Convert to drawer
   - Rename to `<SessionDrawer />`
   - Slide-over behavior
   - Backdrop blur
   - Same session list content

4. **`<ChatInput />`** - Simplify
   - Reduce height (48px min vs 72px)
   - Cleaner styling
   - Keep auto-resize, Shift+Enter behavior

5. **Settings Page** - Completely restructure
   - Add tab navigation
   - Split form into sections
   - Better visual hierarchy

---

## 📋 Implementation Phases

### Phase 1: Foundation & Shell ⭐ START HERE

**Goal:** Establish the unified layout system across all pages

- [ ] Create `<AppShell />` wrapper component
- [ ] Redesign `<AppHeader />` with new navigation structure
- [ ] Build `<StatusBar />` component
- [ ] Update globals.css with design tokens (spacing, colors)
- [ ] Apply shell to all pages (Chat, Documents, Sessions, Settings, etc.)

**Outcome:** Every page has consistent header/footer, same spacing

---

### Phase 2: Chat Page Overhaul

**Goal:** Reclaim vertical space, modernize chat UX

- [ ] Remove chat page top bar
- [ ] Build `<SlideOverDrawer />` component
- [ ] Convert `<ChatSidebar />` to use drawer
- [ ] Build `<FloatingActionButton />` for "+ New Chat"
- [ ] Add "☰ History" button to open drawer
- [ ] Simplify `<ChatInput />` styling (reduce height)
- [ ] Add status bar to chat page (model, RAG, session)

**Outcome:** Chat feels spacious, modern, focused

---

### Phase 3: Settings Modernization

**Goal:** Make settings navigable and scannable

- [ ] Build `<TabNavigation />` component
- [ ] Split settings form into tabs (General, AI & Models, RAG & Context, Advanced)
- [ ] Improve form field styling (labels, help text, spacing)
- [ ] Add "Reset to Defaults" functionality
- [ ] Better visual hierarchy with sections

**Outcome:** Settings are organized, easy to navigate

---

### Phase 4: Documents & Sessions Polish

**Goal:** Search-first, denser layouts

**Documents:**
- [ ] Add prominent search bar at top
- [ ] Replace large dropzone with compact "+ Upload" button
- [ ] Denser document cards (more metadata, less padding)
- [ ] List/Grid view toggle
- [ ] Improve file status indicators

**Sessions:**
- [ ] Add search bar
- [ ] Clean up session list items (preview text, metadata)
- [ ] Ensure clear distinction from sidebar drawer
- [ ] Click to navigate to chat

**Outcome:** Documents and Sessions are more functional, easier to use

---

### Phase 5: Polish & Responsive

**Goal:** Consistent details, mobile support

- [ ] Consistent loading states (skeleton loaders everywhere)
- [ ] Hover states on all interactive elements
- [ ] Focus states for accessibility
- [ ] Mobile responsive layout (header collapse, bottom nav)
- [ ] Keyboard shortcuts (document and test)
- [ ] Error states and empty states
- [ ] Toast notifications for actions

**Outcome:** App feels polished, works on all devices

---

### Phase 6: Future Enhancements (Post-MVP)

**Not blocking, but valuable:**
- Command palette (Cmd+K) for global search/navigation
- @mention documents in chat
- Drag-and-drop files into chat
- Playground integration with Prompts Library
- Export chat sessions
- Analytics mini-widgets on dashboard pages
- Keyboard shortcut overlay (press "?" to see shortcuts)

---

## 🎯 Success Metrics

**Before:**
- ❌ 3-level navigation hierarchy
- ❌ Inconsistent layouts (chat vs other pages)
- ❌ Wasted vertical space (128px of chrome in chat)
- ❌ Confusing feature groupings
- ❌ No persistent context (model/RAG status)
- ❌ Settings page is overwhelming (endless scroll)

**After:**
- ✅ 2-level navigation maximum
- ✅ Unified layout shell on all pages
- ✅ Minimal chrome in chat (48px header + 32px status bar = 80px total)
- ✅ Clear, logical feature groupings
- ✅ Persistent status bar showing context
- ✅ Settings organized into scannable tabs

---

## 🚀 Getting Started

**Next Steps:**
1. Review this plan and validate approach
2. Start with Phase 1 (Foundation & Shell)
3. Build incrementally, test each phase
4. Gather feedback before moving to next phase

**Implementation Notes:**
- UX/design first - build the visual layer before backend integration
- Keep existing stores/API structure (don't break backend)
- Use existing Tailwind/component patterns where possible
- Test responsive behavior at each phase
- Maintain dark theme as primary, light theme as secondary

---

## 💡 Key Design Decisions

**Why Clean Workspace over Application Shell?**
- Better for chat-focused experience (but platform features equally accessible)
- More modern, minimal aesthetic
- Maximizes viewport for content
- Easier responsive/mobile adaptation

**Why Keep Model Selection in Settings?**
- Model choice is a configuration, not a per-message choice
- Reduces cognitive load in chat interface
- Keeps chat clean and focused on conversation
- Status bar shows current model for reference

**Why Keep Sessions Page Lean?**
- Sidebar drawer handles quick switching during chat
- Sessions page is for browsing/searching full history
- Don't over-engineer until we know what users need
- Can add features (filtering, analytics) later based on usage

**Why Keep Playground Separate?**
- Different mental model (testing/comparison vs conversation)
- Avoids complexity in chat interface
- Clear dedicated space for experimentation
- Integration via "Load from Library" and "Save to Session" actions

**Why Tabbed Settings?**
- Easier to scan and navigate than endless scroll
- Clear mental model (AI settings vs RAG settings)
- Can add/remove tabs as features evolve
- Standard pattern users understand

---

**Last Updated:** Initial redesign plan
**Status:** Ready for implementation
**Next:** Begin Phase 1 - Foundation & Shell
