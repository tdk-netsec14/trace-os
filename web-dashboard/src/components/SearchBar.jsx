// Search input with code font, Stitch focus state, and keyboard shortcut badge.
import React, { forwardRef } from 'react';

const SearchBar = forwardRef(function SearchBar({ value, onChange, placeholder, autoFocus }, ref) {
  return (
    <div className="relative">
      <span
        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        style={{ fontSize: '20px' }}
      >
        search
      </span>
      <input
        ref={ref}
        type="text"
        className="input pl-12 pr-4 py-3 text-body-md"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search your activity...'}
        autoFocus={autoFocus}
      />
    </div>
  );
});

export default SearchBar;
