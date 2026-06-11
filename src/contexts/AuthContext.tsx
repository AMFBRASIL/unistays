import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, API_BASE_URL, LoginResponse } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  uuid: string;
  email: string;
  name: string;
  // role property removed
  avatar?: string | null;
  group?: { id: number; name: string };
  properties?: any[]; // user properties access
  permissions?: Record<string, {
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage ao inicializar e validar token
  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Tentar validar o token fazendo uma requisição ao perfil
          // Fazer requisição direta para validar o token
          const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Token válido, carregar dados
            const userData = data.data?.user || data.user || JSON.parse(storedUser);
            setToken(storedToken);
            setUser(userData);
          } else {
            // Token inválido, limpar
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Erro na validação, limpar dados
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }

      setIsLoading(false);
    };

    loadAuthData();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);

      if (response.success && response.data) {
        // O api.ts já extrai data.data, então response.data já contém { user, token, refreshToken }
        const { user, token, refreshToken } = response.data;

        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setToken(token);
        setUser(user);

        toast.success('Login realizado com sucesso!', {
          description: 'Redirecionando para o dashboard...',
        });

        return true;
      } else {
        toast.error('Erro ao fazer login', {
          description: response.error?.message || 'Credenciais inválidas',
        });
        return false;
      }
    } catch (error) {
      toast.error('Erro ao fazer login', {
        description: 'Erro de conexão com o servidor',
      });
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await api.register(data);

      if (response.success && response.data) {
        // O api.ts já extrai data.data, então response.data já contém { user, token, refreshToken }
        const { user, token, refreshToken } = response.data;

        // Salvar no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        setToken(token);
        setUser(user);

        toast.success('Conta criada com sucesso!', {
          description: 'Bem-vindo ao Uni | Stays!',
        });

        return true;
      } else {
        toast.error('Erro ao criar conta', {
          description: response.error?.message || 'Não foi possível criar a conta',
        });
        return false;
      }
    } catch (error) {
      toast.error('Erro ao criar conta', {
        description: 'Erro de conexão com o servidor',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logout realizado com sucesso');
    // A navegação será feita no componente que chama logout usando window.location
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const response = await api.getProfile();
      if (response.success && response.data) {
        const userData = response.data.data?.user || response.data.user;
        if (userData) {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
