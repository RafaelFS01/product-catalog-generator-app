
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import Login from "./pages/Login";
import ManageProducts from "./pages/ManageProducts";
import ProductDetails from "./pages/ProductDetails";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import Settings from "./pages/Settings";
import { MainLayout } from "./components/layout/MainLayout";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProductProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={
                <RequireAuth>
                  <MainLayout />
                </RequireAuth>
              }>
                <Route index element={<Index />} />
                <Route path="gerenciar" element={<ManageProducts />} />
                <Route path="detalhes/:id" element={<ProductDetails />} />
                <Route path="cadastrar" element={<CreateProduct />} />
                <Route path="editar/:id" element={<EditProduct />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
