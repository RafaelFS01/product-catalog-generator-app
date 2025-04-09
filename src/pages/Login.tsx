
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Package } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const from = (location.state as any)?.from?.pathname || '/gerenciar';
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate(from, { replace: true });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (user?.isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Package size={32} className="text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Catálogo de Produtos</CardTitle>
            <CardDescription className="mt-1">
              Faça login para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        type="email" 
                        autoComplete="email"
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••" 
                        type="password" 
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Demonstração: Use qualquer email e senha com pelo menos 6 caracteres
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
