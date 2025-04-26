import React from 'react';
import './CheckBox.css';

export type ViewFilter = 'all' | 'country' | 'region';

interface CountryCheckBoxProps {
  filter: ViewFilter;
  onFilterChange: (f: ViewFilter) => void;
}

const CountryCheckBox: React.FC<CountryCheckBoxProps> = ({ filter, onFilterChange }) => {
  return (
    <div className="filter-container">
      <label>
        <input
          type="radio"
          name="viewFilter"
          checked={filter === 'all'}
          onChange={() => onFilterChange('all')}
        />
        All
      </label>
      <label>
        <input
          type="radio"
          name="viewFilter"
          checked={filter === 'country'}
          onChange={() => onFilterChange('country')}
        />
        Countries
      </label>
      <label>
        <input
          type="radio"
          name="viewFilter"
          checked={filter === 'region'}
          onChange={() => onFilterChange('region')}
        />
        Regions
      </label>
    </div>
  );
};

export default CountryCheckBox;
