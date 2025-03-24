import Button from '@mui/material/Button';
import './LanguageButton.css';
import { useLanguage } from "../../../context/LanguageContext";




interface LanguageButtonProps {
  label: string;
}

function LanguageButton({ label }: LanguageButtonProps) {
  const { dispatch } = useLanguage();

  const handleClick = () => {
    console.log(`Adding language: ${label}`);
    dispatch({ type: 'ADD_LANGUAGE', payload: label });
  };

  return <Button  style={{
    backgroundColor: "#574B60", marginTop: '6px', textTransform: "none"
  }}
  
   variant="contained" onClick={handleClick}>{label}</Button>;
}

export default LanguageButton;
