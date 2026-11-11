# Accessibility audit and improvement report

**Target:** WCAG 2.2 Level AA  
**Audit status:** Initial source inspection only. No code change or automated test has been completed.

## Pages inspected

Reviewed repository source for `index.html`, `services.html`, `curriculum.html`, `research.html`, `contact.html`, and `spirituality.html`; shared header/footer partials; `assets/css/style.css`; and `assets/js/main.js` and `assets/js/content-feeds.js`. The homepage has a publications carousel and dynamic Medium/YouTube feeds. The contact page embeds a Google Form and Google Map.

## Findings from source review

| Severity | Finding | Affected scope |
| --- | --- | --- |
| High | Inconsistent document headings; several pages use an `h2` as their first page heading and lack a page-level `h1`. | All six pages; especially index, services, research, curriculum, contact. |
| High | Placeholder alternative text is present, including “Replace with Ajay Yadav's professional photograph”, “Replace with a classroom…” and “Responsive Image”. Some curriculum/research diagrams use empty alt text despite appearing informative. | Homepage, curriculum, services, research. Verify every image against actual content before deciding its alternative. |
| High | The shared stylesheet does not define a consistent visible keyboard-focus indicator. | Shared interactive controls and links. |
| Medium | Mobile navigation button’s accessible name remains “Open navigation menu” when expanded, and shared JavaScript does not close it with Escape. | Shared header. |
| Medium | Carousel buttons are named, but the scrollable track is not keyboard-focusable and is not named as a region. | Homepage publications carousel. |
| Medium | Tab JavaScript supports left/right arrows but not up/down, Home, and End. | Spirituality & Wisdom page. |
| Medium | Social links have an `aria-label` on a generic `div`, not a named navigation landmark. | Shared header. |
| Unverified | The Google Form's controls, field labels, instructions, validation/errors, keyboard operation, and zoom behavior are third-party content and cannot be established from the embedding markup alone. | Contact page. |
| Unverified | Google Map accessibility and an alternative for location information need manual review. | Contact page. |
| Unverified | Color contrast has not been measured on rendered pages and interaction states. | All pages. |
| Unverified | Screen-reader announcements of dynamic Medium/YouTube feed success, empty, and error states need assistive-technology testing. Feed containers have `aria-live="polite"`. | Homepage. |

## Changes implemented

**None.** A separate branch, `accessibility/wcag-aa-audit`, was created from `main`, but the repository write attempt was denied. No files have been modified or committed. No test workflow or test dependencies have been added.

## Automated test results

**Not run.** There is no automated accessibility test setup on the branch at this time. No pass/fail result is available.

## Manual testing still required

- Inspect each image and diagram with the content owner; replace placeholder alt text and provide text alternatives for informative diagrams.
- Measure contrast on rendered text, controls, links, focus/hover/active states against WCAG AA thresholds.
- Keyboard-test menus, carousel, tabs, skip navigation, all links and controls at desktop and mobile breakpoints.
- Test 200% and 400% zoom/reflow, text spacing, sticky header and anchor targets, and forced-colors mode.
- Screen-reader test with NVDA and/or VoiceOver for headings, landmarks, menu state, tabs, carousel, and live feed updates.
- Test the actual embedded and direct Google Form for labels, instructions, error announcement, keyboard accessibility, and zoom; verify the map has a usable accessible alternative.

This source review is not a WCAG conformance claim. Automated checks and manual assistive-technology testing are still needed.
