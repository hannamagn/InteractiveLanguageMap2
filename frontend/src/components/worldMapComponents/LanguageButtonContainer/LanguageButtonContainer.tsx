import { useState, useRef, useEffect } from 'react';
import './LanguageButtonContainer.css';
import LanguageButton from '../LanguageButton/LanguageButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useLanguage } from '../../../context/LanguageContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';




const response = await fetch('https://interactivelanguagemap2-backend.onrender.com/language/all-names');
//const response = await fetch('http://localhost:3000/language/all-names');

if (!response.ok) {
  throw new Error(`HTTP error! Status: ${response.status}`);
}

const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const allLanguages = await response.json();

function LanguageButtonContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { state, dispatch } = useLanguage();
  const [renderCount, setRenderCount] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce effect
  const debouncedSetQuery = useRef(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 200)
  ).current;

  useEffect(() => {
    debouncedSetQuery(searchQuery);
  }, [searchQuery, debouncedSetQuery]);


  const filteredLanguages = allLanguages.filter((lang: string) =>
    lang.toLowerCase().includes(debouncedQuery.toLowerCase())
  );
  
  // Only show a portion of the filtered list
  const displayedLanguages = filteredLanguages.slice(0, renderCount);
  
  useEffect(() => {
    const container = containerRef.current;
  
    const handleScroll = () => {
      if (!container) return;
  
      const nearBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
  
      if (nearBottom && renderCount < filteredLanguages.length) {
        setRenderCount(prev => prev + 100);
      }
    };
  
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [renderCount, filteredLanguages.length]);
  
  
  useEffect(() => {
    setRenderCount(100);
  }, [debouncedQuery]);
  

  const handleRemove = (lang: string) => {
    dispatch({ type: 'TOGGLE_LANGUAGE', payload: lang });
  };

  const handleClearAll = () => {
    dispatch({ type: 'CLEAR_ALL_LANGUAGES' });
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
      {state.selectedLanguages.length > 1 && (
        <Button
          id="clearAllButton"
          variant="contained"
          onClick={handleClearAll}
          sx={{
            backgroundColor: '#574B60',
            color: '#FFFFFF',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#A1A2A5',
              cursor: 'pointer',
            }
          }}
        >
          Clear All
        </Button>
      )}
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

      

      <div className="container"  ref={containerRef}>
      {displayedLanguages.length > 0 ? (
        displayedLanguages.map((lang: string, index:number) => (
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
