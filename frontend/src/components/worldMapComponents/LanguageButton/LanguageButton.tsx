import Button from '@mui/material/Button';
import './LanguageButton.css';

function LanguageButton({label}: { label: string }) {
    const handleClick = () => {
        console.log('Button clicked! and we like ' + label );
        // Add layer for language function

        };

    return (
        <Button variant="contained" onClick={handleClick}>
            {label}
        </Button>
        );

  
}
export default LanguageButton