import React, { createContext, useContext } from 'react';

const SSRContext = createContext(null);

export const useSSR = () => useContext(SSRContext);

export const SSRProvider = ({ children, data }) => {
  return (
    <SSRContext.Provider value={data}>
      {children}
    </SSRContext.Provider>
  );
};
