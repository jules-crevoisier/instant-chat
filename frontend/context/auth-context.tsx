"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface User {
  id: number;
  username: string;
  bio?: string;
  avatar?: string;
  avatar_color?: string;
  status: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      socket.emit("user_login", user.id);
    }
  }, [user]);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch("http://localhost:3001/api/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        socket.auth = { token: authToken };
        socket.connect();
      } else {
        logout();
      }
    } catch (error) {
      console.error("Auth error:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    socket.auth = { token: newToken };
    socket.connect();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

