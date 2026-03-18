import { useState, useEffect } from "react";

const AUTH_KEY = "game_changer_manager_auth";
const PIN = "manager123";

export function useManagerAuth() {
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === PIN) {
      setIsAuthed(true);
    }
    setIsChecking(false);
  }, []);

  const login = (pin: string) => {
    if (pin === PIN) {
      localStorage.setItem(AUTH_KEY, pin);
      setIsAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthed(false);
  };

  return { isAuthed, isChecking, login, logout };
}
