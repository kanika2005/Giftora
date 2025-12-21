import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }){
  const [user, setUser] = useState(()=> {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  const value = {
    user,
    login,
    logout,
    isAdmin: user?.isAdmin || false,
    isLoggedIn: !!user
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(){
  const ctx = useContext(UserContext);
  if(!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
