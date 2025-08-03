import { useEffect, useRef } from 'react';

/**
 * Hook para gerenciar o estado da aplicação em dispositivos iOS
 * Resolve problema de "congelamento" após redirecionamento para outros apps
 */
export const useIOSAppState = () => {
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRestoringRef.current) {
        // A página voltou ao foco após estar oculta
        console.log('🔄 iOS: Restaurando estado da aplicação após mudança de contexto');
        
        // Verificar se foi por causa de um download
        const wasDownloadActive = sessionStorage.getItem('ios-download-active');
        if (wasDownloadActive) {
          console.log('📄 iOS: Restauração após download de cupom fiscal');
          sessionStorage.removeItem('ios-download-active');
        }
        
        // Força re-render dos componentes React
        window.dispatchEvent(new Event('resize'));
        
        // Força re-inicialização de todos os event listeners
        setTimeout(() => {
          const interactiveElements = document.querySelectorAll('button, [role="button"], a, input, select, textarea');
          interactiveElements.forEach(element => {
            if (element instanceof HTMLElement) {
              element.style.pointerEvents = 'none';
              setTimeout(() => {
                element.style.pointerEvents = 'auto';
              }, 10);
            }
          });
        }, 200);
        
        // Reset flag
        isRestoringRef.current = false;
      } else if (document.visibilityState === 'hidden') {
        // A página foi ocultada (possível mudança de app)
        console.log('⏸️ iOS: Aplicação foi ocultada - preparando para restauração');
        isRestoringRef.current = true;
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // Evento específico para quando a página volta do cache do navegador
      if (event.persisted || performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
        console.log('🔄 iOS: Página restaurada do cache - reiniciando interações');
        
        // Força re-inicialização de event listeners
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
          // Trigger re-render forçado para todos os componentes
          const buttons = document.querySelectorAll('button, [role="button"]');
          buttons.forEach(button => {
            if (button instanceof HTMLElement) {
              button.style.pointerEvents = 'none';
              setTimeout(() => {
                button.style.pointerEvents = 'auto';
              }, 10);
            }
          });
        }, 100);
      }
    };

    const handleFocus = () => {
      // Quando a janela recebe foco novamente
      if (isRestoringRef.current) {
        console.log('🎯 iOS: Janela recebeu foco - restaurando funcionalidades');
        
        // Re-habilita todas as interações
        setTimeout(() => {
          document.body.style.pointerEvents = 'none';
          setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
          }, 50);
        }, 100);
        
        isRestoringRef.current = false;
      }
    };

    const handleBeforeUnload = () => {
      // Preparar para possível mudança de contexto
      isRestoringRef.current = true;
    };

    // iOS Safari específico - detectar se estamos no iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
    
    if (isIOS || isSafari) {
      console.log('📱 iOS/Safari detectado - habilitando correções de estado');
      
      // Event listeners para gerenciar mudanças de visibilidade
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('pageshow', handlePageShow);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('pageshow', handlePageShow);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  return {
    isRestoring: isRestoringRef.current
  };
};