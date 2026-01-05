# MY-AI Frontend Implementation Plan

**Project**: Personal AI Assistant Frontend Refactor
**Approach**: Hybrid - Visual-first, refactor as needed
**Target User**: Single user (personal project)
**Primary Use Case**: General-purpose AI chat with memory (RAG-enhanced)

---

## Architecture Decisions

### Routing Structure
```
app/
├── (main)/                    # Route group - main app layout
│   ├── layout.tsx            # Main app layout (nav, sidebar)
│   ├── page.tsx              # "/" - Chat interface (default)
│   ├── documents/
│   │   └── page.tsx          # "/documents" - Doc library
│   ├── sessions/
│   │   └── page.tsx          # "/sessions" - Chat history
│   └── settings/
│       └── page.tsx          # "/settings" - User settings
├── dev/
│   └── page.tsx              # "/dev" - Current dev page (preserved as-is)
└── layout.tsx                # Root layout (theme provider, globals)
```

### Component Organization
```
components/
├── features/                  # Feature-specific components
│   ├── chat/                 # Main chat interface components
│   ├── documents/            # Document management components
│   └── sessions/             # Session management components
├── ui/                        # Shared UI primitives
│   ├── Button.tsx            # (already exists)
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Dialog.tsx
└── dev/                       # Dev page components (existing components)
    ├── SystemHealthDashboard.tsx
    ├── ConfigSection.tsx
    ├── RAGStatisticsPanel.tsx
    ├── RequestAnalyticsPanel.tsx
    ├── TerminalOutput.tsx
    └── FileStatus.tsx
```

### State Management
**Tool**: Zustand (already installed)

**Stores**:
- `chatStore.ts` - Messages, sessions, current session
- `settingsStore.ts` - User preferences, config
- `documentStore.ts` - Uploaded docs, indexed files
- `uiStore.ts` - Sidebar state, modals, UI preferences

### Session Persistence Strategy
**Align with backend RAG Journal system**:
- Sessions tied to `session_id` used by backend Journal context
- Store session metadata locally (title, date, message count)
- Messages stored in backend via Journal system
- Query backend for session history when switching sessions
- LocalStorage for quick session list, backend as source of truth

### UI Style
**Mix of ChatGPT + Discord**:
- Discord-style: Collapsible sidebar with session channels
- ChatGPT-style: Clean, focused chat area with message flow
- Minimal chrome, content-focused
- Smooth animations and transitions

---

## Implementation Phases

### PHASE 0: Preparation ✅
- [x] Requirements gathering
- [x] Architecture decisions
- [x] Plan documentation

### PHASE 1: Main Chat Interface (VISUAL-FIRST) 🎯 **START HERE**
**Goal**: Build production-ready chat experience (UI first, refactor as needed)

**Tasks**:
1. Create basic route structure (`app/(main)/page.tsx`)
2. Design and build main chat layout
   - Collapsible sidebar (session list)
   - Main chat area (messages + input)
   - Top bar (title, settings button)
3. Build chat components in `components/features/chat/`:
   - `ChatInterface.tsx` - Main container
   - `ChatSidebar.tsx` - Session list with new chat button
   - `ChatMessages.tsx` - Message list with RAG context
   - `ChatInput.tsx` - Message input with file upload
   - `ChatMessage.tsx` - Individual message component
4. Create initial Zustand store (`stores/chatStore.ts`)
5. Wire up to existing API (`lib/api.ts`)
6. Add loading states and error handling
7. Implement RAG context display (collapsible, like dev page)

**Deliverable**: Functional, beautiful chat interface at `/`

**Refactor as needed**: Extract shared UI components when patterns emerge

---

### PHASE 2: Session Management
**Goal**: Multiple chat threads with backend persistence

**Tasks**:
1. Extend `chatStore` for session management
2. Implement session storage (localStorage + backend Journal)
3. Build session CRUD operations:
   - Create new session (generate session_id)
   - Switch between sessions
   - Delete sessions
   - Auto-generate session titles (first message or AI-generated)
4. Update sidebar to show session list
5. Add session metadata (date, message count, last activity)
6. Implement session persistence:
   - Save session list to localStorage
   - Load messages from backend Journal when switching
7. Build `/sessions` page for history management

**Deliverable**: Full session management with backend sync

---

### PHASE 3: Document Management
**Goal**: Clean document upload and library interface

**Tasks**:
1. Move `DocumentDropzone` to `components/features/documents/`
2. Refactor for main UI styling (match chat interface)
3. Build document library components:
   - `DocumentList.tsx` - Grid/list view of documents
   - `DocumentCard.tsx` - Individual document with status
   - `DocumentUpload.tsx` - Refactored dropzone
4. Create `documentStore.ts` for state
5. Integrate with existing ingest API
6. Show document status (uploading, processing, indexed, failed)
7. Add document deletion
8. Show RAG context links (which docs were used in chat)
9. Build `/documents` page
10. Add document upload to chat interface (inline or modal)

**Deliverable**: Complete document management system

---

### PHASE 4: Settings & Configuration
**Goal**: User-friendly settings interface

**Tasks**:
1. Build settings page layout (tabs or sections)
2. Create settings components:
   - Provider/model selection
   - RAG settings (Library, Journal, top-k, similarity threshold)
   - Chat preferences (temperature, max_tokens, top_p)
   - UI preferences (theme, sidebar behavior, message density)
3. Create `settingsStore.ts`
4. Wire up to backend config API (`/v1/config`)
5. Add form validation
6. Implement save/reset functionality
7. Build `/settings` page
8. Add quick settings access from chat interface

**Deliverable**: Complete settings management

---

### PHASE 5: Routing & Navigation
**Goal**: Clean routing with proper layouts

**Tasks**:
1. Implement route group structure
2. Build main app layout (`app/(main)/layout.tsx`):
   - Optional top navigation
   - Consistent styling
   - Layout transitions
3. Move dev page to `app/dev/page.tsx`
4. Move current dev components to `components/dev/`
5. Update all imports
6. Add navigation component (if needed)
7. Implement route transitions

**Deliverable**: Proper routing structure with layouts

---

### PHASE 6: Component Organization & Refactoring
**Goal**: Clean up component structure, extract patterns

**Tasks**:
1. Review components for shared patterns
2. Extract common UI components to `components/ui/`:
   - Card
   - Input
   - Select
   - Dialog/Modal
   - Tooltip
   - Badge
3. Create consistent component APIs
4. Update all imports
5. Document component usage
6. Remove unused code
7. Consolidate duplicate logic

**Deliverable**: Clean, maintainable component library

---

### PHASE 7: Polish & Enhancement
**Goal**: Production-quality UX

**Tasks**:
1. Add animations and transitions
2. Implement loading skeletons
3. Add empty states (no sessions, no documents, no messages)
4. Error boundaries for graceful failures
5. Keyboard shortcuts:
   - New chat (Cmd/Ctrl+N)
   - Search sessions (Cmd/Ctrl+K)
   - Focus input (/)
   - Toggle sidebar (Cmd/Ctrl+B)
6. Mobile responsiveness
7. Dark mode polish (ensure all components work)
8. Performance optimization:
   - Lazy loading
   - Virtualized lists for long message history
   - Debounced inputs
9. Accessibility audit
10. Loading state improvements

**Deliverable**: Polished, production-ready application

---

### PHASE 8: Advanced Features (Future)
**Nice-to-have features for later**:

- [ ] Chat export (markdown, JSON)
- [ ] Message editing/regeneration
- [ ] Advanced RAG controls per message
- [ ] Prompt templates library
- [ ] Custom system prompts per session
- [ ] Message search across all sessions
- [ ] Document preview in chat
- [ ] Voice input
- [ ] Streaming responses
- [ ] Real-time status updates (websockets)
- [ ] Advanced analytics/insights
- [ ] Session sharing/export

---

## Technical Decisions Log

### Why Zustand?
- Already installed
- Lightweight (no provider hell)
- Simple API
- Perfect for client-side state
- Easy debugging

### Why Route Groups?
- Share layout without affecting URLs
- Clean separation of main app vs dev tools
- Better code organization
- Easier to add features

### Why Feature-based Organization?
- Co-locate related components
- Easier to find code
- Clear boundaries
- Scales better than flat structure

### Session Storage Strategy
**Why localStorage + backend?**
- localStorage: Fast session list, offline access
- Backend Journal: Source of truth, cross-device potential
- Best of both worlds: Speed + persistence

---

## Current Status

**Phase**: PHASE 1 (Main Chat Interface)
**Status**: COMPLETED ✅ (Visual interface complete, functional with backend)
**Next Phase**: PHASE 2 (Session Backend Sync) or continue with polish

### What's Done (Phase 1):
- ✅ Zustand chat store with session management
- ✅ API client updated with memory/session endpoints
- ✅ ChatInterface component (main container with sidebar toggle)
- ✅ ChatSidebar component (Discord-style session list)
- ✅ ChatMessages component (message display with auto-scroll)
- ✅ ChatMessage component (individual messages with RAG context)
- ✅ ChatInput component (textarea with send functionality)
- ✅ Dev page moved to `/dev` route with all existing functionality
- ✅ Fixed nested button hydration error
- ✅ Beautiful ChatGPT + Discord hybrid UI
- ✅ Session persistence with localStorage

### Ready to Test:
- Main interface works when backend API is running (http://localhost:8000)
- Sessions, messages, and chat flow all functional
- Dev page preserved at `/dev` with all original components

---

## Notes & Decisions

### Design Decisions
- **Chat Style**: Mix of ChatGPT (clean messages) + Discord (sidebar channels)
- **Color**: Blue accent (existing), dark mode support
- **Animations**: Smooth, not distracting
- **Density**: Medium (not too cramped, not too spacious)

### Backend Integration
- Keep existing `lib/api.ts` (well-structured, typed)
- No backend changes needed (out of scope)
- Session IDs align with Journal context system
- RAG context display matches backend response structure

### Dev Page
- Preserve existing dev page functionality
- Move to `/dev` route
- Keep all current components intact
- Use as testing/debugging tool

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Can send/receive messages
- [ ] Messages display cleanly with RAG context
- [ ] Sidebar shows sessions
- [ ] Can create new chat session
- [ ] Loading and error states work
- [ ] UI matches design vision (ChatGPT + Discord mix)
- [ ] Responsive layout

### Project Complete When:
- [ ] All 7 phases implemented
- [ ] No console errors
- [ ] All features working
- [ ] Dev page moved and functional
- [ ] Clean, maintainable code
- [ ] Documentation updated
