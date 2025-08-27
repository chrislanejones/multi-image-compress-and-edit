# ImageHorse - Requirements & Implementation Details

## Current Issue: Image Selection & Zoom Functionality

### Problem Statement

Currently when the page loads, no image is selected which shows "Select an image to see resize options" message. Users need to manually click an image to see the preview. Additionally, zoom functionality is inconsistent across the app and lacks keyboard shortcuts.

### Requirements

#### 1. Auto-Select First Image on Page Load

- **Behavior**: When images are loaded, automatically select `images[0]`
- **UI Impact**: Image preview canvas shows the first image immediately
- **Maintain**: Keep existing click-to-select and arrow navigation working
- **State Management**: Update both context and zustand store

#### 2. Global Zoom Functionality

- **Scope**: Zoom should work throughout the app when there's a selected image
- **Keyboard Shortcuts**:
  - `Alt + -` (Alt + Minus) = Zoom Out
  - `Alt + =` (Alt + Plus/Equals) = Zoom In
- **Store Updates**: Modify zustand store to handle global zoom state
- **Components Affected**:
  - Image Selected Preview Canvas
  - Edit modes (crop, blur, paint, text)
  - All image viewing components

### Implementation Plan

#### Phase 1: Auto-Select First Image

1. Update `useImageContext` to auto-select first image when images change
2. Ensure selected image state syncs between context and zustand
3. Test navigation still works (prev/next arrows, click selection)

#### Phase 2: Global Zoom System

1. **Zustand Store Updates**:

   ```typescript
   interface EditorStore {
     // ... existing
     globalZoom: number; // Global zoom level (25-400%)
     setGlobalZoom: (zoom: number) => void;
     zoomIn: () => void; // Increment by 25%
     zoomOut: () => void; // Decrement by 25%
   }
   ```

2. **Keyboard Shortcuts**:
   - Add global event listeners for `Alt + -` and `Alt + =`
   - Prevent default browser zoom behavior
   - Only active when image is selected

3. **Component Integration**:
   - Replace local zoom states with global zoom
   - Update all image rendering components
   - Ensure zoom persists across mode changes

#### Phase 3: UI/UX Improvements

1. **Zoom Indicator**: Show current zoom level in UI
2. **Zoom Controls**: +/- buttons in toolbar
3. **Zoom Limits**: Enforce min (25%) and max (400%) zoom
4. **Reset Zoom**: Double-click or keyboard shortcut to reset to 100%

### Technical Details

#### Files to Modify

1. **Context Layer**:
   - `app/context/image-context.tsx` - Auto-select logic
2. **Store Layer**:
   - `app/store/editor-store.ts` - Global zoom state & actions
3. **Components**:
   - `app/routes/resize-and-optimize.tsx` - Keyboard listeners
   - `app/components/ImageResizer.tsx` - Remove auto-select message logic
   - `app/components/BlurCanvas.tsx` - Use global zoom
   - `app/components/PaintCanvas.tsx` - Use global zoom
   - `app/components/TextTool.tsx` - Use global zoom
   - All toolbar components - Zoom controls

4. **Toolbars**:
   - `app/components/toolbars/MainToolbar.tsx` - Zoom indicators
   - All mode toolbars - Use global zoom actions

#### State Flow

```
Images Load → Auto-select images[0] → Update Context & Zustand
User Input → Keyboard/Click → Update Global Zoom → Re-render Components
Mode Change → Preserve Zoom Level → Apply to New Component
```

#### Event Handling

```typescript
useEffect(() => {
  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.altKey && selectedImage) {
      if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "=") {
        e.preventDefault();
        zoomIn();
      }
    }
  };

  window.addEventListener("keydown", handleKeyboard);
  return () => window.removeEventListener("keydown", handleKeyboard);
}, [selectedImage, zoomIn, zoomOut]);
```

### Testing Checklist

- [ ] First image auto-selects on page load
- [ ] Click selection still works
- [ ] Arrow navigation still works
- [ ] Alt+- zooms out globally
- [ ] Alt+= zooms in globally
- [ ] Zoom persists across mode changes
- [ ] Zoom applies to all image components
- [ ] Zoom limits are enforced (25%-400%)
- [ ] No conflicts with browser shortcuts

### Success Criteria

1. **Immediate Value**: Users see an image preview immediately upon page load
2. **Consistency**: Zoom level maintained across all editing modes
3. **Accessibility**: Keyboard shortcuts work reliably
4. **Performance**: No lag when zooming or switching modes
5. **User Experience**: Intuitive zoom behavior throughout the app

### Future Enhancements (Out of Scope)

- Zoom to fit/fill buttons
- Mouse wheel zoom support
- Pinch-to-zoom on mobile
- Zoom history/undo
- Per-image zoom memory
