import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  // Return the provider wrapping the children!
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Use this separate export to avoid the Fast Refresh error shown in your screenshot
export const useLanguage = () => {
  return useContext(LanguageContext);
};