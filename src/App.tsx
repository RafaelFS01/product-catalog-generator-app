
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductProvider } from "./contexts/ProductContext";
import { ClienteProvider } from "./contexts/ClienteContext";
import { PedidoProvider } from "./contexts/PedidoContext";
import Login from "./pages/Login";
import ManageProducts from "./pages/ManageProducts";
import ProductDetails from "./pages/ProductDetails";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import ManageClientes from "./pages/ManageClientes";
import CreateCliente from "./pages/CreateCliente";
import EditCliente from "./pages/EditCliente";
import ClienteDetails from "./pages/ClienteDetails";
import ManagePedidos from "./pages/ManagePedidos";
import CreatePedido from "./pages/CreatePedido";
import EditPedido from "./pages/EditPedido";
import PedidoDetails from "./pages/PedidoDetails";
import ManagePagamentos from "./pages/ManagePagamentos";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import { MainLayout } from "./components/layout/MainLayout";
import { RequireAuth } from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProductProvider>
          <ClienteProvider>
            <PedidoProvider>
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
                <Route path="clientes" element={<ManageClientes />} />
                <Route path="clientes/cadastrar" element={<CreateCliente />} />
                <Route path="clientes/editar/:id" element={<EditCliente />} />
                <Route path="clientes/detalhes/:id" element={<ClienteDetails />} />
                <Route path="pedidos" element={<ManagePedidos />} />
                <Route path="pedidos/criar" element={<CreatePedido />} />
                <Route path="pedidos/editar/:id" element={<EditPedido />} />
                <Route path="pedidos/detalhes/:id" element={<PedidoDetails />} />
                <Route path="pagamentos" element={<ManagePagamentos />} />
                <Route path="configuracoes" element={<Settings />} />
                <Route path="dashboard" element={<Dashboard />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
              </BrowserRouter>
            </PedidoProvider>
          </ClienteProvider>
        </ProductProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
