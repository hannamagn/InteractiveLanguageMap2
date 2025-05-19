import React from 'react';
import './Checkbox.css';

export type ViewFilter = 'all' | 'country' | 'region';

interface CountryCheckBoxProps {
  filter: ViewFilter;
  onFilterChange: (f: ViewFilter) => void;
}

const CountryCheckBox: React.FC<CountryCheckBoxProps> = ({ filter, onFilterChange }) => {
  return (
    <div className="filter-container">
      <h2 className="filter-title">Filter and information</h2>
      <div className="legend">
        <div className="legend-item">
          <span className="legend-color official" /> Official language
        </div>
        <div className="legend-item">
          <span className="legend-color unofficial" /> Spoken language
        </div>
      </div>

      <label className="filter-label">
        <input
          type="radio"
          name="viewFilter"
          checked={filter === 'all'}
          onChange={() => onFilterChange('all')}
        />
        <span className="tooltip-wrapper">
                  Default view
                  <span className="tooltip-text">
                  Displays every territory where the language occurs:<br/>
                  • Countries and regions where it’s official<br/>
                  • Regions if it’s unofficial but has regional data<br/>
                  • Whole countries if no regional breakdown exists
                  </span>
                </span>
              </label>
      
      <label className="filter-label">
        <input
          type="radio"
          name="viewFilter"
          checked={filter === 'country'}
          onChange={() => onFilterChange('country')}
        />
        Countries
      </label>
      <label className="filter-label">
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
