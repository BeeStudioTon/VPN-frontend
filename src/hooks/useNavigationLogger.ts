import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useNavigationLogger = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Сохраняем оригинальную функцию navigate
    const originalNavigate = navigate;
    
    // Переопределяем navigate для логирования
    const loggedNavigate = (to: any, options?: any) => {
      console.log(`[Navigation] Redirecting from ${location.pathname} to ${typeof to === 'string' ? to : to?.pathname}`);
      return originalNavigate(to, options);
    };

    // Логируем начальный путь при монтировании
    console.log(`[Navigation] App initialized at ${location.pathname}`);

    // Возвращаем оригинальный navigate при размонтировании
    return () => {
      // Восстанавливаем оригинальный navigate
    };
  }, []);

  useEffect(() => {
    // Логируем каждое изменение пути
    console.log(`[Navigation] Route changed to ${location.pathname}`, {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
  }, [location]);
};