// src/components/Pagination.jsx
import React from 'react';

function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  isLoading,
  itemType = "items" // "songs", "playlists", "items"
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Genereerime lehe numbrid
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Kui lehekülgi on vähe, näita kõiki
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Kui lehekülgi on palju, näita praeguse ümber
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalItems === 0) {
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>No {itemType} found</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination-container">
      {/* INFO ROW */}
      <div className="pagination-info">
        <span>
          Showing {startItem}-{endItem} of {totalItems} {itemType}
          {totalPages > 1 && (
            <span className="page-info"> • Page {currentPage} of {totalPages}</span>
          )}
        </span>
      </div>

      {/* NAVIGATION ROW */}
      {totalPages > 1 && (
        <div className="pagination-nav">
          {/* PREVIOUS */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="pagination-btn pagination-prev"
          >
            ← Previous
          </button>

          {/* PAGE NUMBERS */}
          <div className="pagination-numbers">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="pagination-dots">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className={`pagination-btn pagination-number ${
                      page === currentPage ? 'active' : ''
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* NEXT */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="pagination-btn pagination-next"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
