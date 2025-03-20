import './LanguageButtonContainer.css';
import LanguageButton from '../LanguageButton/LanguageButton'

const languages = ['English', 'Spanish', 'French', 'German', 'Japanese'];

function LanguageButtonContainer() {
  return (
    <div>
      <h2>Select a Language</h2>
      {/* Map through the languages array and create a button for each */}
      <div className = "container">
        {languages.map((lang, index) => (
          <LanguageButton key={index} label={lang} />
        ))}
      </div>
    </div>
  );
}

export default LanguageButtonContainer;