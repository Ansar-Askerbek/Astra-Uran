import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Импортируем страницы из слоя Pages
import HomePage from "@/pages/home/ui/HomePage";
import DashboardPage from "@/pages/dashboard/ui/DashBoardPage";

// Глобальные стили (Tailwind)
import "./app/styles/index.css"; 

/**
 * Типизация путей для безопасности
 */
type PagePath = "/" | "/dashboard" | "/map" | "/ai";

export default function App() {
  // Состояние текущей "страницы"
  const [currentPath, setCurrentPath] = useState<PagePath>("/");

  /**
   * Универсальная функция навигации
   */
  const navigate = (path: PagePath) => {
    setCurrentPath(path);
    // Прокрутка вверх при смене страницы
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-black text-white antialiased selection:bg-cyan-500/30">
      
      {/* AnimatePresence позволяет анимировать исчезновение компонентов */}
      <AnimatePresence mode="wait">
        
        {/* Главная страница */}
        {currentPath === "/" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage onNavigate={navigate} />
          </motion.div>
        )}

        {/* Дашборд управления */}
        {currentPath === "/dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DashboardPage onNavigate={navigate} />
          </motion.div>
        )}

        {/* Здесь можно добавить /map или /ai в будущем */}

      </AnimatePresence>

      {/* Глобальные уведомления (Toast) можно добавить здесь */}
    </div>
  );
}