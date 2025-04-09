
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextProps {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock login - In real app, this would be a Firebase Auth call
      if (email && password) {
        const user: AuthUser = {
          email,
          isAuthenticated: true
        };
        localStorage.setItem('authUser', JSON.stringify(user));
        setUser(user);
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${email}!`,
        });
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
