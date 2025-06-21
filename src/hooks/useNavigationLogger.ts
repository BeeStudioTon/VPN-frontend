import { useEffect } from 'react';
import { useLocation, To, NavigateOptions } from 'react-router-dom';

/**
 * Хук для логирования навигации:
 * - Показывает текущий и новый путь
 * - Отображает место вызова navigate в коде
 * - Не модифицирует оригинальные функции
 */
export const useNavigationLogger = () => {
  const location = useLocation();

  // Логируем изменения маршрута + стек вызовов
  useEffect(() => {
    const stackTrace = new Error().stack
      ?.split('\n')
      .slice(0, 10) // Берем 3 строки стека (без учета самого хука)
      .join('\n');

    console.groupCollapsed(`[Navigation] Route changed to ${location.pathname}`);
    console.log('Previous path:', location.state?.from || '(initial load)');
    console.log('Search params:', location.search);
    console.log('Called from:', `\n${stackTrace}`);
    console.groupEnd();
  }, [location]);

  /** Обертка для navigate с логированием */
  const loggedNavigate = (navigate: (to: To, options?: NavigateOptions) => void, param: string) => {
    return (to: To, options?: NavigateOptions) => {
      const stackTrace = new Error().stack
        ?.split('\n')
        .slice(0, 10) // Берем 3 строки стека
        .join('\n');

      console.groupCollapsed(`[Navigation] Navigating to ${
        typeof to === 'string' ? to : to.pathname
      }`);
      console.log('From:', location.pathname);
      console.log('Options:', options);
      console.log('Called from:', `\n${stackTrace}`);
      console.groupEnd();

      // Добавляем информацию о предыдущем пути в state
      const navOptions = {
        ...options,
        state: {
          ...options?.state,
          from: location.pathname
        }
      };

      console.log('[loggedNavigate]: ',param)

      navigate(to, navOptions);
    };
  };

  return { loggedNavigate };
};