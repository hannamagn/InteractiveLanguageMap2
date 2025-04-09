import { useState } from 'react';
import './LanguageButtonContainer.css';
import LanguageButton from '../LanguageButton/LanguageButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useLanguage } from '../../../context/LanguageContext'; // make sure the path matches your project
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';

const response = await fetch('http://localhost:3000/language/all-names');

if (!response.ok) {
  throw new Error(`HTTP error! Status: ${response.status}`);
}

const allLanguages = await response.json();

function LanguageButtonContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const { state, dispatch } = useLanguage();

  const filteredLanguages = allLanguages.filter(lang =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = (lang: string) => {
    dispatch({ type: 'TOGGLE_LANGUAGE', payload: lang });
  };

  return (
    <div className="languageContainer">
      <TextField
        id="outlined-basic"
        label="Search for a language"
        variant="filled"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchQuery('')}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiFilledInput-root': { backgroundColor: '#FFFFFF' },
          '& .MuiFilledInput-root.Mui-focused': { backgroundColor: '#FFFFFF' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#A1A2A5' },
          '& .MuiFilledInput-underline:after': { borderBottomColor: '#A1A2A5' }
        }}
        inputProps={{ style: { fontSize: 15 } }}
        InputLabelProps={{ style: { fontSize: 15 } }}
      />

      <div className="selectedcontainer">
        {state.selectedLanguages.map((lang, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => handleRemove(lang)}
            style={{
              margin: '4px',
              backgroundColor: '#A26769',
              color: '#FFFFFF',
              textTransform: 'none',
            }}
          >
            {lang} ✕
          </Button>
        ))}
      </div>

      <div className="container">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((lang, index) => (
            <LanguageButton key={index} label={lang} />
          ))
        ) : (
          <p style={{ color: '#888', marginLeft: '10px' }}>
            No matching languages found
          </p>
        )}
      </div>
    </div>
  );
}

export default LanguageButtonContainer;
