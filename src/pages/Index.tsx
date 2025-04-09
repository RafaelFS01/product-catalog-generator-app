
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the product management page
    navigate('/gerenciar');
  }, [navigate]);
  
  return (
    <div className="min-h-[300px] flex items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  );
};

export default Index;
