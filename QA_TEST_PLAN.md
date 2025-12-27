# Comprehensive QA Test Plan - Book Reccs
## Mobile & Desktop Testing

---

## 1. VISUAL/UI TESTING

### 1.1 Header Component
- [ ] **Desktop**: Header displays "Book Reccs" title with correct font size (text-5xl to text-7xl)
- [ ] **Mobile**: Header text scales appropriately (text-5xl)
- [ ] **Desktop**: Subtitle "Find your next favourite read" displays correctly
- [ ] **Mobile**: Subtitle text is readable and properly sized
- [ ] **Both**: Text color is white and readable against background
- [ ] **Both**: Header is centered and properly spaced

### 1.2 FeatureSection Component
- [ ] **Desktop**: Section displays in 2-column grid layout (md:grid-cols-2)
- [ ] **Mobile**: Section displays in single column (grid-cols-1)
- [ ] **Both**: Image fills container completely (object-cover)
- [ ] **Both**: Image has 8px border radius (rounded-lg)
- [ ] **Both**: Section has 600px minimum height
- [ ] **Both**: Section fills full screen width (w-screen with negative margins)
- [ ] **Both**: Image loads correctly from `/book-reccs-cover.png`
- [ ] **Both**: Left side text content is readable with proper contrast
- [ ] **Both**: No overflow or horizontal scrolling issues
- [ ] **Both**: Border radius applies correctly to outer container

### 1.3 BookInput Component
- [ ] **Desktop**: Input field is properly sized and styled
- [ ] **Mobile**: Input field is touch-friendly (min 44px height)
- [ ] **Both**: Search icon displays on left side of input
- [ ] **Both**: Loading spinner appears during search
- [ ] **Both**: Border highlights on focus (border-white/40)
- [ ] **Both**: Placeholder text is visible and readable
- [ ] **Both**: Selected books display as chips with X button
- [ ] **Both**: Filter pills are visible and clickable
- [ ] **Both**: Submit button is properly styled and positioned

### 1.4 TrendingSection Component
- [ ] **Desktop**: Books display in horizontal scrollable row
- [ ] **Mobile**: Books scroll horizontally without breaking layout
- [ ] **Both**: Book covers display correctly (or placeholder if missing)
- [ ] **Both**: Book titles and authors are readable
- [ ] **Both**: Star ratings display correctly (if available)
- [ ] **Both**: Hover effects work on desktop
- [ ] **Both**: Clicking a book opens recommendation modal

### 1.5 RecommendationModal Component
- [ ] **Desktop**: Modal is centered and max-width-4xl
- [ ] **Mobile**: Modal is responsive with proper padding
- [ ] **Both**: Close button (X) is visible and clickable
- [ ] **Both**: Book cover image displays (or placeholder)
- [ ] **Both**: Book title and author are displayed correctly
- [ ] **Both**: Rating stars display correctly (if available)
- [ ] **Both**: Reasoning text is readable
- [ ] **Both**: Goodreads link is clickable
- [ ] **Both**: Video carousel displays (if videos available)
- [ ] **Both**: "Get Another" and "Start Over" buttons work
- [ ] **Both**: Confetti animation plays (for non-trending books)

### 1.6 Loading States
- [ ] **Both**: Loading overlay appears during recommendation fetch
- [ ] **Both**: Loading spinner animates correctly
- [ ] **Both**: "Finding your next favorite read..." text displays
- [ ] **Both**: Overlay blocks interaction during loading

### 1.7 Error States
- [ ] **Both**: Error message displays in red alert box
- [ ] **Both**: Error text is readable: "Couldn't get a recommendation. Please try again."
- [ ] **Both**: Error styling is consistent (bg-red-900/30, border-red-800)

---

## 2. RESPONSIVE DESIGN TESTING

### 2.1 Breakpoint Testing
- [ ] **Mobile (320px - 640px)**: All components stack vertically
- [ ] **Tablet (641px - 768px)**: Layout transitions appropriately
- [ ] **Desktop (769px+)**: 2-column layout for FeatureSection
- [ ] **Large Desktop (1024px+)**: Content remains centered with max-width-3xl

### 2.2 Mobile-Specific Tests
- [ ] **Touch Targets**: All buttons are at least 44x44px
- [ ] **Input Fields**: Keyboard appears correctly on focus
- [ ] **Dropdown**: Search results dropdown is scrollable
- [ ] **Modal**: Modal is scrollable if content exceeds viewport
- [ ] **Horizontal Scroll**: Trending books section scrolls smoothly
- [ ] **Filter Pills**: Horizontal scroll works for filter pills
- [ ] **Text Size**: All text is readable without zooming

### 2.3 Desktop-Specific Tests
- [ ] **Hover States**: All interactive elements have hover effects
- [ ] **Mouse Interactions**: Click, hover, and focus states work
- [ ] **Keyboard Navigation**: Tab order is logical
- [ ] **Wide Screens**: Content doesn't stretch too wide

### 2.4 Orientation Testing (Mobile)
- [ ] **Portrait**: Layout works correctly
- [ ] **Landscape**: Layout adapts appropriately
- [ ] **Rotation**: No layout breaks on orientation change

---

## 3. FUNCTIONALITY TESTING

### 3.1 Book Search
- [ ] **Both**: Search triggers after 2+ characters
- [ ] **Both**: Debounce works (300ms delay)
- [ ] **Both**: Results dropdown appears below input
- [ ] **Both**: Results display book cover, title, and author
- [ ] **Both**: Clicking a result adds book to selected list
- [ ] **Both**: Search clears after selecting a book
- [ ] **Both**: Can search for multiple books
- [ ] **Both**: Maximum 5 books can be selected
- [ ] **Both**: Duplicate books cannot be added
- [ ] **Both**: Loading spinner shows during search

### 3.2 Selected Books Management
- [ ] **Both**: Selected books display as chips
- [ ] **Both**: X button removes book from selection
- [ ] **Both**: Book title truncates if too long (max-w-[150px])
- [ ] **Both**: Can remove books in any order
- [ ] **Both**: Selection persists until removed or reset

### 3.3 Filter Selection
- [ ] **Both**: All 5 filters are visible and clickable
  - fast-paced
  - page-turner
  - timeless classic
  - slow-burn
  - lots of awards
- [ ] **Both**: Filters toggle on/off correctly
- [ ] **Both**: Active filters have purple styling
- [ ] **Both**: Multiple filters can be selected
- [ ] **Both**: Filter state persists during recommendation

### 3.4 Recommendation Generation
- [ ] **Both**: Submit button disabled with < 2 books
- [ ] **Both**: Submit button enabled with 2-5 books
- [ ] **Both**: Loading overlay appears on submit
- [ ] **Both**: Recommendation modal opens with result
- [ ] **Both**: Selected books are excluded from recommendation
- [ ] **Both**: Previously recommended books are excluded
- [ ] **Both**: Active filters are applied to recommendation
- [ ] **Both**: Error handling works if API fails

### 3.5 Recommendation Modal
- [ ] **Both**: Modal opens when recommendation is received
- [ ] **Both**: Close button (X) closes modal
- [ ] **Both**: Clicking outside modal closes it (if implemented)
- [ ] **Both**: Book details fetch correctly (cover, rating)
- [ ] **Both**: YouTube videos load and display
- [ ] **Both**: "Get Another" button generates new recommendation
- [ ] **Both**: "Start Over" button resets all state
- [ ] **Both**: Goodreads link opens in new tab
- [ ] **Both**: Confetti animation plays (non-trending only)

### 3.6 Trending Books
- [ ] **Both**: Trending books load on page load
- [ ] **Both**: Clicking trending book opens modal
- [ ] **Both**: Trending book modal shows "trending" reasoning
- [ ] **Both**: Trending book modal doesn't show "Get Another" button
- [ ] **Both**: Fallback books display if API fails

### 3.7 State Management
- [ ] **Both**: Reset clears all selected books
- [ ] **Both**: Reset clears all filters
- [ ] **Both**: Reset closes recommendation modal
- [ ] **Both**: Reset clears recommendation history
- [ ] **Both**: State persists during session
- [ ] **Both**: Page refresh resets state (expected behavior)

---

## 4. API INTEGRATION TESTING

### 4.1 Google Books API
- [ ] **Both**: Book search returns results
- [ ] **Both**: Results include cover images when available
- [ ] **Both**: Results include title and author
- [ ] **Both**: Results include rating and ratingsCount (if available)
- [ ] **Both**: Handles empty search results gracefully
- [ ] **Both**: Handles API errors gracefully

### 4.2 Gemini API
- [ ] **Both**: Recommendation generation works with valid API key
- [ ] **Both**: Returns valid JSON with title, author, reasoning
- [ ] **Both**: Handles missing API key gracefully
- [ ] **Both**: Handles API errors with user-friendly message
- [ ] **Both**: Trending books list generates correctly
- [ ] **Both**: Filters are applied to recommendation prompt
- [ ] **Both**: Exclude list is applied to recommendation prompt

### 4.3 YouTube API
- [ ] **Both**: Videos load for recommended books
- [ ] **Both**: Video carousel displays correctly
- [ ] **Both**: Handles missing API key gracefully
- [ ] **Both**: Handles no results gracefully
- [ ] **Both**: Video thumbnails load correctly

### 4.4 Backend API (if used)
- [ ] **Both**: `/api/trending-books` endpoint works
- [ ] **Both**: `/api/refresh-trending` endpoint works
- [ ] **Both**: CORS headers allow frontend access
- [ ] **Both**: API returns expected data format

---

## 5. ERROR HANDLING TESTING

### 5.1 Network Errors
- [ ] **Both**: Handles network timeout gracefully
- [ ] **Both**: Handles offline state gracefully
- [ ] **Both**: Shows error message for failed requests
- [ ] **Both**: User can retry after error

### 5.2 API Errors
- [ ] **Both**: Missing Gemini API key shows appropriate message
- [ ] **Both**: Invalid API responses handled gracefully
- [ ] **Both**: Rate limiting errors handled gracefully
- [ ] **Both**: 404/500 errors don't break the app

### 5.3 User Input Errors
- [ ] **Both**: Empty search doesn't break app
- [ ] **Both**: Special characters in search handled correctly
- [ ] **Both**: Very long book titles don't break layout
- [ ] **Both**: Invalid book selections handled

### 5.4 Edge Cases
- [ ] **Both**: Rapid clicking doesn't cause duplicate requests
- [ ] **Both**: Submitting while loading is prevented
- [ ] **Both**: Closing modal during loading handled correctly
- [ ] **Both**: Multiple rapid searches handled correctly

---

## 6. PERFORMANCE TESTING

### 6.1 Load Times
- [ ] **Both**: Initial page load < 3 seconds
- [ ] **Both**: Images load progressively
- [ ] **Both**: No layout shift during image load
- [ ] **Both**: API calls complete in reasonable time

### 6.2 Responsiveness
- [ ] **Both**: UI remains responsive during API calls
- [ ] **Both**: Debounce prevents excessive API calls
- [ ] **Both**: Loading states prevent duplicate submissions
- [ ] **Both**: Smooth animations (60fps)

### 6.3 Resource Usage
- [ ] **Both**: No memory leaks on extended use
- [ ] **Both**: Images are optimized (not too large)
- [ ] **Both**: No excessive re-renders
- [ ] **Both**: Efficient state updates

---

## 7. ACCESSIBILITY TESTING

### 7.1 Keyboard Navigation
- [ ] **Both**: All interactive elements are keyboard accessible
- [ ] **Both**: Tab order is logical
- [ ] **Both**: Focus indicators are visible
- [ ] **Both**: Enter/Space activate buttons
- [ ] **Both**: Escape closes modal

### 7.2 Screen Reader
- [ ] **Both**: All images have alt text
- [ ] **Both**: Buttons have descriptive labels
- [ ] **Both**: Form inputs have labels
- [ ] **Both**: Error messages are announced
- [ ] **Both**: Loading states are announced

### 7.3 Color Contrast
- [ ] **Both**: Text meets WCAG AA contrast ratios
- [ ] **Both**: Interactive elements have sufficient contrast
- [ ] **Both**: Error messages are distinguishable
- [ ] **Both**: Focus states are visible

### 7.4 ARIA Attributes
- [ ] **Both**: Modal has proper ARIA attributes
- [ ] **Both**: Loading states have ARIA live regions
- [ ] **Both**: Error messages have proper roles
- [ ] **Both**: Form inputs have proper labels

---

## 8. CROSS-BROWSER TESTING

### 8.1 Desktop Browsers
- [ ] **Chrome**: All features work correctly
- [ ] **Firefox**: All features work correctly
- [ ] **Safari**: All features work correctly
- [ ] **Edge**: All features work correctly

### 8.2 Mobile Browsers
- [ ] **iOS Safari**: All features work correctly
- [ ] **Chrome Mobile**: All features work correctly
- [ ] **Samsung Internet**: All features work correctly

### 8.3 Browser-Specific Issues
- [ ] **Both**: CSS Grid works in all browsers
- [ ] **Both**: Flexbox works in all browsers
- [ ] **Both**: Backdrop blur works (or graceful fallback)
- [ ] **Both**: Animations work smoothly

---

## 9. SPECIFIC COMPONENT TESTS

### 9.1 SubmitButton Component
- [ ] **Both**: Button is disabled when < 2 books selected
- [ ] **Both**: Button is enabled when 2-5 books selected
- [ ] **Both**: Button shows loading state during request
- [ ] **Both**: Button is properly styled

### 9.2 FilterPills Component
- [ ] **Both**: Pills display correctly
- [ ] **Both**: Active state styling is correct
- [ ] **Both**: Hover states work on desktop
- [ ] **Both**: Touch targets are adequate on mobile

### 9.3 VideoCarousel Component
- [ ] **Both**: Videos display in carousel
- [ ] **Both**: Carousel is scrollable/swipeable
- [ ] **Both**: Loading state displays correctly
- [ ] **Both**: Empty state handled gracefully

---

## 10. INTEGRATION TESTING

### 10.1 End-to-End User Flows
- [ ] **Flow 1**: Search → Select 2 books → Add filter → Get recommendation → View modal → Get another
- [ ] **Flow 2**: Search → Select 5 books → Get recommendation → Start over
- [ ] **Flow 3**: Click trending book → View modal → Close
- [ ] **Flow 4**: Search → Select books → Remove one → Add another → Get recommendation

### 10.2 State Persistence
- [ ] **Both**: Selected books persist during recommendation
- [ ] **Both**: Filters persist during recommendation
- [ ] **Both**: Recommendation history prevents duplicates
- [ ] **Both**: Modal state manages correctly

---

## TEST EXECUTION NOTES

### Test Environment Setup
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Test Devices: 
  - Desktop: Chrome, Firefox, Safari, Edge
  - Mobile: iOS Safari, Chrome Mobile
  - Screen Sizes: 320px, 375px, 768px, 1024px, 1920px

### Prerequisites
- [ ] Backend server running
- [ ] Frontend dev server running
- [ ] `.env` file with `VITE_GEMINI_API_KEY` set
- [ ] `.env` file with `VITE_YOUTUBE_API_KEY` set (optional)
- [ ] Network connection for API calls

### Test Data
- Valid book searches: "Harry Potter", "1984", "The Great Gatsby"
- Invalid searches: "", "a", special characters
- Edge cases: Very long titles, books with no covers, books with no ratings

---

## BUG REPORTING TEMPLATE

When issues are found, document:
1. **Device/Browser**: e.g., "iPhone 13, Safari iOS 17"
2. **Screen Size**: e.g., "375x812"
3. **Steps to Reproduce**: Numbered list
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happens
6. **Screenshots**: If applicable
7. **Console Errors**: Any JavaScript errors
8. **Network Errors**: Any failed API calls

---

## PRIORITY LEVELS

- **P0 (Critical)**: App doesn't load, core functionality broken
- **P1 (High)**: Major feature not working, poor UX
- **P2 (Medium)**: Minor feature issue, visual inconsistency
- **P3 (Low)**: Cosmetic issue, nice-to-have improvement

---

**Ready for Review - Please confirm before execution**

