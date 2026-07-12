import { useState, useEffect, useRef, useCallback } from 'react';
import { COMPETITIONS } from '../config/competitions.js';
import '../styles/CompetitionSelector.css';

// ─── JSDoc types ──────────────────────────────────────────────────────────────

/**
 * @typedef {import('../config/competitions.js').Competition} Competition
 */

// ─── Module-level derived data (js-index-maps: build once, not per render) ───

/**
 * Competitions shown as tabs (featured: true in the config).
 * Adding `featured: true` to any entry in competitions.js automatically
 * promotes it to a tab here — no component code changes needed.
 *
 * @type {Competition[]}
 */
const FEATURED = COMPETITIONS.filter((c) => c.featured);

/**
 * Competitions shown in the "+" More dropdown (not featured).
 *
 * @type {Competition[]}
 */
const OVERFLOW = COMPETITIONS.filter((c) => !c.featured);

/**
 * Set of featured codes for O(1) membership checks.
 * (js-set-map-lookups: use Set for repeated lookups instead of .includes())
 *
 * @type {Set<string>}
 */
const FEATURED_CODES = new Set(FEATURED.map((c) => c.code));

// ─── CompetitionSelector ──────────────────────────────────────────────────────

/**
 * Renders featured competitions as tab buttons and non-featured ones inside a
 * "+ More" overflow dropdown. Fully controlled — state lives in the parent.
 *
 * **Extensibility contract**: to promote a competition to a tab, set
 * `featured: true` in `src/config/competitions.js`. No changes here needed.
 *
 * **Known assumption that could break when adding competitions**:
 * - `FEATURED` and `OVERFLOW` are derived at module load time. Adding a new
 *   entry with `featured: true` at runtime (e.g. from an API) would NOT be
 *   reflected. This is fine as long as the config stays a static JS file —
 *   if the list ever becomes dynamic, move the `filter` calls inside the
 *   component so they re-derive on each render.
 * - The tab bar does not virtualise or wrap. If FEATURED grows very long
 *   (10+), horizontal overflow-scroll kicks in. Consider a max-featured count
 *   guard at that point.
 *
 * @param {Object}   props
 * @param {string}   props.selectedCode - Currently active competition code.
 * @param {function(string): void} props.onSelect - Called with the competition
 *   code when the user picks a new competition.
 * @param {string}   [props.className]  - Optional extra class for the root element.
 */
export default function CompetitionSelector({ selectedCode, onSelect, className = '' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const moreRef = useRef(null);

  // Close dropdown when the user clicks outside
  // (client-event-listeners: attach once, clean up on unmount)
  useEffect(() => {
    if (!dropdownOpen) return;

    function handleOutsideClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  // Stable callback for toggling the "+ More" panel
  // (rerender-functional-setstate: pass updater fn to avoid stale closure)
  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  /**
   * Handles selection from either tabs or the dropdown.
   * Closes the dropdown automatically when an item is picked from it.
   *
   * @param {string} code
   */
  const handleSelect = useCallback(
    (code) => {
      onSelect(code);
      setDropdownOpen(false);
    },
    [onSelect]
  );

  // Is the currently selected competition in the overflow list?
  const overflowIsActive = !FEATURED_CODES.has(selectedCode);

  return (
    <nav
      className={`comp-selector ${className}`}
      aria-label="Competition selector"
      role="tablist"
    >
      {/* ── Featured tabs ── */}
      {FEATURED.map((comp) => {
        const isActive = comp.code === selectedCode;
        return (
          <button
            key={comp.code}
            id={`comp-tab-${comp.code}`}
            className={`comp-tab${isActive ? ' comp-tab--active' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-controls="fixture-panel"
            onClick={() => handleSelect(comp.code)}
          >
            {comp.name}
          </button>
        );
      })}

      {/* ── "+ More" overflow tab (only rendered when overflow list is non-empty) ── */}
      {/* rendering-conditional-render: ternary, not && */}
      {OVERFLOW.length > 0 ? (
        <div className="comp-more-wrap" ref={moreRef}>
          <button
            id="comp-tab-more"
            className={`comp-tab comp-tab--more${overflowIsActive ? ' comp-tab--more-active' : ''}`}
            role="tab"
            aria-selected={overflowIsActive}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-controls="fixture-panel"
            onClick={toggleDropdown}
          >
            {overflowIsActive
              ? COMPETITIONS.find((c) => c.code === selectedCode)?.name ?? '+ More'
              : '+ More'}
            <span className="comp-tab__chevron" aria-hidden="true">
              {/* Inline SVG chevron — no extra icon dependency */}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {/* Dropdown panel */}
          {dropdownOpen ? (
            <div
              id="comp-more-panel"
              className="comp-dropdown"
              role="listbox"
              aria-label="More competitions"
            >
              {OVERFLOW.map((comp) => {
                const isActive = comp.code === selectedCode;
                return (
                  <button
                    key={comp.code}
                    className={`comp-dropdown__item${isActive ? ' comp-dropdown__item--active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(comp.code)}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
