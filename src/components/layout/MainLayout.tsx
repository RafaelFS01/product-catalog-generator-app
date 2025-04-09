
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Package, FileText, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Package size={24} />
            <span>Catálogo de Produtos</span>
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <LogOut size={16} className="mr-2" />
                Sair
              </Button>
            </div>
          )}
        </div>
      </header>
      
      {user && (
        <nav className="bg-secondary shadow-sm">
          <div className="container mx-auto px-4">
            <ul className="flex overflow-x-auto py-2 gap-1 md:gap-2">
              <li>
                <Link 
                  to="/gerenciar" 
                  className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1 hover:bg-secondary-foreground/10"
                >
                  <Package size={16} /> Produtos
                </Link>
              </li>
              <li>
                <Link 
                  to="/configuracoes" 
                  className="px-3 py-2 text-sm rounded-md inline-flex items-center gap-1 hover:bg-secondary-foreground/10"
                >
                  <Settings size={16} /> Configurações
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          Sistema de Gerenciamento de Catálogo de Produtos &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};
