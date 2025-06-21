import { useEffect } from 'react';
import { useLocation, useNavigate, To, NavigateOptions } from 'react-router-dom';

export const useNavigationLogger = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Логируем инициализацию
    console.groupCollapsed(`[Navigation] App initialized at ${location.pathname}`);
    console.log('Initial location:', location);
    console.groupEnd();

    // Сохраняем оригинальную функцию navigate
    const originalNavigate = navigate;

    // Создаем обертку с правильными типами
    const loggedNavigate = (to: To, options?: NavigateOptions): void => {
      console.groupCollapsed(`[Navigation] Navigating from ${location.pathname} to ${
        typeof to === 'string' ? to : (to as { pathname?: string }).pathname
      }`);
      console.log('From:', location);
      console.log('To:', to);
      console.log('Options:', options);
      console.groupEnd();
      originalNavigate(to, options);
    };

    // Переопределяем функцию navigate
    (navigate as any) = loggedNavigate;

    return () => {
      // Восстанавливаем оригинальную функцию при размонтировании
      (navigate as any) = originalNavigate;
    };
  }, [location, navigate]);

  useEffect(() => {
    console.groupCollapsed(`[Navigation] Route changed to ${location.pathname}`);
    console.log('New location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state
    });
    console.groupEnd();
  }, [location]);
};