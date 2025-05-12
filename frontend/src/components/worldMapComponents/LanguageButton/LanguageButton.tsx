import Button from '@mui/material/Button';
import './LanguageButton.css';
import { useLanguage } from "../../../context/LanguageContext";


const selectedbuttoncolor = '#A26769'

interface LanguageButtonProps {
  label: string;
}

function LanguageButton({ label }: LanguageButtonProps) {
  const { state, dispatch } = useLanguage();
  const isSelected = state.selectedLanguages.includes(label);

  const handleClick = () => {
    console.log(`Toggling language: ${label}`);
    dispatch({ type: 'TOGGLE_LANGUAGE', payload: label });
  };

  return (
    <Button
      sx={{
        height: 'auto',
        minHeight: '20px',
        backgroundColor: isSelected ? selectedbuttoncolor : '#574B60', // Highlight if selected
        marginTop: '6px',
        textTransform: 'none',
        '&:hover': {
              backgroundColor: '#A1A2A5',
              cursor: 'pointer',
        }
      }}
      variant="contained"
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}

export default LanguageButton;
