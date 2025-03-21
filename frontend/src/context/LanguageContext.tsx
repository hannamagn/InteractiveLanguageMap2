import React, { createContext, useContext, useReducer } from 'react';

type State = {
  selectedLanguages: string[];
};

type Action =
  | { type: 'ADD_LANGUAGE'; payload: string }
  | { type: 'REMOVE_LANGUAGE'; payload: string };

const initialState: State = {
  selectedLanguages: [],
};

function languageReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_LANGUAGE':
      if (state.selectedLanguages.includes(action.payload)) return state;
      return { ...state, selectedLanguages: [...state.selectedLanguages, action.payload] };
    case 'REMOVE_LANGUAGE':
      return { ...state, selectedLanguages: state.selectedLanguages.filter(lang => lang !== action.payload) };
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