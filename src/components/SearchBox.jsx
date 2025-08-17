// src/components/SearchBox.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBox({ onActualSearch, placeholderText = "Search by song title, artist or username" }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const term = searchTerm.trim();
    if (!term) return;

    if (typeof onActualSearch === 'function') {
      onActualSearch(term); // lase Headeril või parentil otsustada, mida teha
    } else {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="search"
        className="search-input"
        placeholder={placeholderText}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="search-button">SEARCH</button>
    </form>
  );
}

export default SearchBox;