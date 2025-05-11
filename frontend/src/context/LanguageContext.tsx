import React, { createContext, useContext, useReducer } from 'react';

type State = {
  selectedLanguages: string[];
};

type Action =
  | { type: 'TOGGLE_LANGUAGE'; payload: string }
  | { type: 'CLEAR_ALL_LANGUAGES' };

const initialState: State = {
  selectedLanguages: [],
};

function languageReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TOGGLE_LANGUAGE': 
      return {
        ...state,
        selectedLanguages: state.selectedLanguages.includes(action.payload)
          ? state.selectedLanguages.filter(lang => lang !== action.payload) // Remove if already selected
          : [...state.selectedLanguages, action.payload] // Add if not selected
        
      };
    case 'CLEAR_ALL_LANGUAGES':
      return {
        ...state,
        selectedLanguages: [],
      };

    default:
      return state;
  }
}

const LanguageContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  return (
    <LanguageContext.Provider value={{ state, dispatch }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;