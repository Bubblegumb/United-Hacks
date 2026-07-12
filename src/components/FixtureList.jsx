import { useState, useEffect } from 'react';
import FixtureCard from './FixtureCard';
import '../styles/FixtureList.css';

/**
 * Re-exported for consumers that import only from FixtureList.
 *
 * @typedef {import('./FixtureCard').Match} Match
 */

const SKELETON_COUNT = 3;
const ITEMS_PER_PAGE = 8;

function SkeletonCard() {
  return (
    <div className="fixture-skeleton" aria-hidden="true">
      <div className="skeleton-shine" style={{ width: '120px', marginLeft: 'auto' }}></div>
      <div className="skeleton-shine" style={{ width: '64px' }}></div>
      <div className="skeleton-shine" style={{ width: '120px', marginRight: 'auto' }}></div>
      <div className="skeleton-shine" style={{ width: '40px', marginLeft: 'auto' }}></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="fixture-list__empty" role="status">
      No fixtures found for this competition.
    </div>
  );
}

function ErrorState({ error }) {
  let message = error;

  if (error.includes('429') || error.includes('Rate limit')) {
    message = (
      <>
        Rate limit reached (10 requests/minute on the free tier).<br/>
        Please wait a moment and try again.
      </>
    );
  } else if (error.includes('404')) {
    message = (
      <>
        We couldn't find any fixtures for this selection.<br/>
        The tournament might not have occurred in the selected year (e.g. World Cup in a non-tournament year).
      </>
    );
  } else if (error.includes('403')) {
    message = (
      <>
        Access Denied.<br/>
        This competition is not available on your current API subscription tier.
      </>
    );
  } else {
    message = (
      <>
        An error occurred while fetching fixtures.<br/>
        {error}
      </>
    );
  }

  return (
    <div className="fixture-list__empty" role="alert">
      {message}
    </div>
  );
}

/**
 * Renders a paginated list of FixtureCard components.
 */
export default function FixtureList({ matches, loading, error, className = '' }) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when competition changes
  useEffect(() => {
    setCurrentPage(1);
  }, [matches]);

  if (loading) {
    return (
      <section className={`fixture-list ${className}`} aria-busy="true" aria-label="Loading fixtures">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className={`fixture-list ${className}`}>
        <ErrorState error={error} />
      </section>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <section className={`fixture-list ${className}`}>
        <EmptyState />
      </section>
    );
  }

  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);
  const paginatedMatches = matches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section className={`fixture-list ${className}`} aria-label="Fixtures">
      {paginatedMatches.map((match) => (
        <FixtureCard key={match.id} match={match} />
      ))}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-arrow"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            PREV
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="page-arrow"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            NEXT
          </button>
        </div>
      )}
    </section>
  );
}
