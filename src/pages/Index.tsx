
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, Settings, FileText, Inbox, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading } = useProducts();
  
  // Análise dos dados
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + product.precoFardo, 0);
  const avgUnitPrice = totalProducts ? products.reduce((sum, product) => sum + product.precoUnitario, 0) / totalProducts : 0;
  
  // Dados para o gráfico rápido
  const chartData = products
    .sort((a, b) => b.precoFardo - a.precoFardo)
    .slice(0, 5)
    .map(product => ({
      name: product.nome.length > 15 ? product.nome.substring(0, 15) + '...' : product.nome,
      price: product.precoFardo
    }));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel Principal</h1>
        <Button asChild>
          <Link to="/dashboard">
            <LayoutDashboard size={16} className="mr-2" />
            Dashboard Completo
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                <h2 className="text-3xl font-bold">{totalProducts}</h2>
              </div>
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <h2 className="text-3xl font-bold">{formatCurrency(totalValue)}</h2>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preço Médio</p>
                <h2 className="text-3xl font-bold">{formatCurrency(avgUnitPrice)}</h2>
              </div>
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Produtos por Preço</CardTitle>
            <CardDescription>Produtos com maior preço de fardo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${formatCurrency(value as number)}`, 'Preço']} />
                    <Bar dataKey="price" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando dados...' : 'Nenhum produto cadastrado ainda'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Principais funções do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/gerenciar">
                  <Inbox size={16} className="mr-2" />
                  Gerenciar Produtos
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/cadastrar">
                  <Package size={16} className="mr-2" />
                  Cadastrar Produto
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/configuracoes">
                  <Settings size={16} className="mr-2" />
                  Configurações
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/dashboard">
                  <LayoutDashboard size={16} className="mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
