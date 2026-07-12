import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { COMPETITIONS } from '../config/competitions';
import '../styles/CompetitionSelector.css';

/**
 * @typedef {import('../config/competitions').Competition} Competition
 */

/**
 * Renders the top header bar, including:
 * - Left branding text
 * - Custom competition dropdown selector
 *
 * @param {Object}   props
 * @param {string}   props.selectedCode - Currently active competition code.
 * @param {function(string): void} props.onSelect - Called with the competition code.
 * @param {number}   props.season - Currently active season.
 * @param {function(number): void} props.onSeasonSelect - Called with the season year.
 */
export default function CompetitionSelector({ selectedCode, onSelect, season, onSeasonSelect }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const seasonDropdownRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const seasons = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => currentYear - i);
  }, [currentYear]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (seasonDropdownOpen && seasonDropdownRef.current && !seasonDropdownRef.current.contains(e.target)) {
        setSeasonDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen, seasonDropdownOpen]);

  // Close dropdowns on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setSeasonDropdownOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
    if (!dropdownOpen) setSeasonDropdownOpen(false);
  }, [dropdownOpen]);

  const toggleSeasonDropdown = useCallback(() => {
    setSeasonDropdownOpen((prev) => !prev);
    if (!seasonDropdownOpen) setDropdownOpen(false);
  }, [seasonDropdownOpen]);

  const handleSelect = useCallback(
    (code) => {
      onSelect(code);
      setDropdownOpen(false);
    },
    [onSelect]
  );

  const handleSeasonSelect = useCallback(
    (s) => {
      onSeasonSelect(s);
      setSeasonDropdownOpen(false);
    },
    [onSeasonSelect]
  );

  const activeCompetition = COMPETITIONS.find((c) => c.code === selectedCode) ?? COMPETITIONS[0];

  return (
    <div className="nav">
      <div className="nav-left">FIXTURE TRACKER</div>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* League Dropdown */}
        <div className="header__dropdown-wrap" ref={dropdownRef}>
          <div
            className="nav-select"
            role="button"
            tabIndex={0}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onClick={toggleDropdown}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDropdown(); }}
          >
            {activeCompetition.name}
          </div>
          {dropdownOpen && (
            <div className="nav-dropdown" role="listbox">
              {COMPETITIONS.map((comp) => {
                const isActive = comp.code === selectedCode;
                return (
                  <button
                    key={comp.code}
                    className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(comp.code)}
                  >
                    {comp.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Season Dropdown */}
        <div className="header__dropdown-wrap" ref={seasonDropdownRef}>
          <div
            className="nav-select"
            role="button"
            tabIndex={0}
            aria-haspopup="listbox"
            aria-expanded={seasonDropdownOpen}
            onClick={toggleSeasonDropdown}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSeasonDropdown(); }}
          >
            SEASON: {season}
          </div>
          {seasonDropdownOpen && (
            <div className="nav-dropdown" role="listbox" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {seasons.map((s) => {
                const isActive = s === season;
                return (
                  <button
                    key={s}
                    className={`nav-dropdown-item ${isActive ? 'active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSeasonSelect(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
