

# Responsive Design Improvements

The app currently has basic mobile support but several issues need fixing for a polished responsive experience across phone, tablet, and desktop.

## Current Issues

- **Mobile nav overflow**: On small screens, nav links (MUSIC, VIDEOS, TOUR, NEWS, BIO) display horizontally and overflow off-screen -- NEWS and BIO are cut off
- **No hamburger menu**: There's no way to access all navigation on mobile
- **Social icons hidden**: The social/utility icons in the sidebar bottom get lost or overflow on mobile
- **Listing grid**: Always 3 columns -- too cramped on phones (should be 2 on mobile)
- **Video grid**: Always 2 columns -- fine on tablet but could be 1 column on small phones
- **Tour list ticket buttons**: Ticket links can get pushed off-screen on narrow devices
- **Detail pages**: The two-column layout (info + image) already stacks on mobile via `md:flex-row`, which is good
- **Bio/News cover image**: `aspect-ratio: 5/2` works but could be taller on mobile for visual impact

## Plan

### 1. Mobile Hamburger Menu (Sidebar.tsx + index.css)

Replace the horizontal nav overflow with a proper hamburger menu on mobile:
- Add a hamburger icon button (Menu icon from lucide-react) visible only on mobile (below 768px)
- Hide the nav links by default on mobile
- When hamburger is tapped, show a full-screen overlay with nav links stacked vertically, social icons, and a close button
- On desktop, keep the current fixed left sidebar exactly as-is
- The social icons and user link move into the mobile overlay menu

### 2. Listing Grid Responsive (index.css)

Update `.listing-grid` to use responsive columns:
- Mobile (below 640px): 2 columns
- Tablet (641-1024px): 3 columns (current)
- Desktop (1025px+): 3 columns

### 3. Video Grid Responsive (index.css)

Update `.video-grid`:
- Mobile (below 640px): 1 column
- Tablet and up: 2 columns (current)

### 4. Tour List Mobile Polish (TourList.tsx)

- Ensure ticket buttons wrap properly on small screens
- Stack date/venue vertically on mobile (already partially done with `sm:flex-row`)

### 5. Bio/News Cover on Mobile (index.css)

- Change `.bio-cover` aspect ratio to `3/2` on mobile for more visual presence

---

## Technical Details

### Files to modify

| File | Changes |
|------|---------|
| `src/components/Sidebar.tsx` | Add hamburger menu state, Menu/X icons, mobile overlay with nav + socials. Use `useIsMobile()` hook. Hide nav links and socials in the default mobile bar, show only logo + hamburger. |
| `src/index.css` | Add mobile overlay styles. Update `.listing-grid` with responsive `grid-template-columns`. Update `.video-grid` with responsive columns. Add mobile `@media` for `.bio-cover` aspect ratio. Hide `.sidebar-nav` and `.sidebar-bottom` on mobile by default, show in overlay. |
| `src/pages/TourList.tsx` | Minor: ensure ticket button doesn't shrink too small with `min-w-fit` or wrapping. |

### Sidebar mobile behavior detail

On screens 768px and below:
- The top bar shows: logo (left) + hamburger icon (right)
- Nav links, social icons, and user link are hidden
- Tapping hamburger opens a full-screen white overlay (z-index 200) with:
  - Close (X) button top-right
  - Nav links stacked vertically, large tap targets
  - Social icons row at the bottom
  - User/login link
- Tapping a link closes the overlay and navigates

On screens above 768px:
- No changes -- sidebar stays fixed on the left as it currently is

