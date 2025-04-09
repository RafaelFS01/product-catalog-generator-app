
import React, { useEffect, useState } from 'react';
import { useProducts } from '@/contexts/ProductContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Package, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { products } = useProducts();
  const [stats, setStats] = useState({
    totalProducts: 0,
    avgUnitPrice: 0,
    avgBulkPrice: 0,
    totalValue: 0
  });
  
  useEffect(() => {
    if (products.length > 0) {
      const totalProducts = products.length;
      const avgUnitPrice = products.reduce((sum, p) => sum + p.precoUnitario, 0) / totalProducts;
      const avgBulkPrice = products.reduce((sum, p) => sum + p.precoFardo, 0) / totalProducts;
      const totalValue = products.reduce((sum, p) => sum + (p.precoFardo * 10), 0); // Estimativa de estoque (10 fardos)
      
      setStats({
        totalProducts,
        avgUnitPrice,
        avgBulkPrice,
        totalValue
      });
    }
  }, [products]);
  
  // Prepare data for price distribution chart
  const priceRanges = [
    { range: 'R$0-25', count: 0 },
    { range: 'R$25-50', count: 0 },
    { range: 'R$50-100', count: 0 },
    { range: 'R$100+', count: 0 },
  ];
  
  products.forEach(product => {
    if (product.precoUnitario < 25) {
      priceRanges[0].count++;
    } else if (product.precoUnitario < 50) {
      priceRanges[1].count++;
    } else if (product.precoUnitario < 100) {
      priceRanges[2].count++;
    } else {
      priceRanges[3].count++;
    }
  });
  
  // Top products by price
  const topPricedProducts = [...products]
    .sort((a, b) => b.precoFardo - a.precoFardo)
    .slice(0, 5)
    .map(product => ({
      name: product.nome.length > 20 ? product.nome.substring(0, 20) + '...' : product.nome,
      price: product.precoFardo
    }));
  
  // Product distribution by weight
  const weightDistribution = products.reduce((acc, product) => {
    const weightKey = product.peso;
    if (!acc[weightKey]) {
      acc[weightKey] = 0;
    }
    acc[weightKey]++;
    return acc;
  }, {} as Record<string, number>);
  
  const weightPieData = Object.entries(weightDistribution).map(([weight, count]) => ({
    name: weight,
    value: count
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <h2 className="text-3xl font-bold">{stats.totalProducts}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preço Unitário Médio</p>
                <h2 className="text-3xl font-bold">{formatCurrency(stats.avgUnitPrice)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preço Fardo Médio</p>
                <h2 className="text-3xl font-bold">{formatCurrency(stats.avgBulkPrice)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total Estimado</p>
                <h2 className="text-3xl font-bold">{formatCurrency(stats.totalValue)}</h2>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Preço Unitário</CardTitle>
            <CardDescription>Quantidade de produtos por faixa de preço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top 5 Produtos por Preço</CardTitle>
            <CardDescription>Produtos com maior preço de fardo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={topPricedProducts}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value as number)}`, 'Preço']}
                  />
                  <Bar dataKey="price" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Peso</CardTitle>
            <CardDescription>Quantidade de produtos por peso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weightPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {weightPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
