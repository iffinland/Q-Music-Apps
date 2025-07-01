// src/components/SearchBox.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Impordi useNavigate

function SearchBox({ placeholderText = "Otsi..." }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
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