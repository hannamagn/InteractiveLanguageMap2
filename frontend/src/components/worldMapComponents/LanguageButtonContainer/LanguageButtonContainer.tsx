import { useState } from 'react';
import './LanguageButtonContainer.css';
import LanguageButton from '../LanguageButton/LanguageButton';
import TextField from '@mui/material/TextField';

const allLanguages = [
  'English', 'Spanish', 'French', 'German', 'Japanese',
  'Arabic', 'Mandarin', 'Portuguese', 'Hindi', 'Russian','Italian',
  'Korean', 'Turkish', 'Dutch', 'Polish', 'Swedish', 'Danish', 'Norwegian',
  // ...add all your 100+ languages here
];


function LanguageButtonContainer() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter based on user input (case-insensitive)
  const filteredLanguages = allLanguages.filter(lang =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="languageContainer" 
    >
      {/* <h2 className="selecth2">Select a Language</h2> */}
      <TextField
        id="outlined-basic"
        label="Search for a language"
        variant="filled"
      
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          '& .MuiFilledInput-root': {
            backgroundColor: '#FFFFFF', // base bg
          },
          '& .MuiFilledInput-root.Mui-focused': {
            backgroundColor: '#FFFFFF', // color when focused
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#A1A2A5', // label color when focused
          },
          '& .MuiFilledInput-underline:after': {
            borderBottomColor: '#A1A2A5', // underline when focused
          }
        }}
        inputProps={{style: {fontSize: 15}}} // font size of input text
        InputLabelProps={{style: {fontSize: 15}}} // font size of input label
      />

      <div className="container">
        {filteredLanguages.length > 0 ? (
          filteredLanguages.map((lang, index) => (
            <LanguageButton key={index} label={lang} />
          ))
        ) : (
          <p style={{ color: '#888', marginLeft: '10px' }}>No matching languages found</p>
        )}
      </div>
    </div>
  );
}

export default LanguageButtonContainer;
