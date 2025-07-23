import React, { createContext, useState } from 'react';

export const FillSurveysContext = createContext();

export const FillSurveysProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState('remaining');

  return (
    <FillSurveysContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </FillSurveysContext.Provider>
  );
};
