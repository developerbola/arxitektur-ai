import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "dashboard.title": "Arxitektur",
      "dashboard.welcome": "Welcome back",
      "dashboard.subtitle": "Pick up where you left off or start a new design.",
      "dashboard.newProject": "New Project",
      "dashboard.initializing": "Initializing...",
      "dashboard.noProjects": "No projects yet",
      "dashboard.emptyState": "Your workspace is empty. Create your first architectural masterpiece to get started.",
      "header.dashboard": "Dashboard",
      "header.signOut": "Sign Out",
      "header.save": "Save",
      "header.saving": "Saving..."
    }
  },
  uz: {
    translation: {
      "dashboard.title": "Arxitektur",
      "dashboard.welcome": "Xush kelibsiz",
      "dashboard.subtitle": "To'xtagan joyingizdan davom eting yoki yangi dizayn boshlang.",
      "dashboard.newProject": "Yangi loyiha",
      "dashboard.initializing": "Tayyorlanmoqda...",
      "dashboard.noProjects": "Hali loyihalar yo'q",
      "dashboard.emptyState": "Ish stolingiz bo'sh. Boshlash uchun birinchi me'moriy asaringizni yarating.",
      "header.dashboard": "Bosh sahifa",
      "header.signOut": "Chiqish",
      "header.save": "Saqlash",
      "header.saving": "Saqlanmoqda..."
    }
  },
  "uz-Cyrl": {
    translation: {
      "dashboard.title": "Arxitektur",
      "dashboard.welcome": "Хуш келибсиз",
      "dashboard.subtitle": "Тўхтаган жойингиздан давом этинг ёки янги дизайн бошланг.",
      "dashboard.newProject": "Янги лойиҳа",
      "dashboard.initializing": "Тайёрланмоқда...",
      "dashboard.noProjects": "Ҳали лойиҳалар йўқ",
      "dashboard.emptyState": "Иш столингиз бўш. Бошлаш учун биринчи меъморий асарингизни яратинг.",
      "header.dashboard": "Бош саҳифа",
      "header.signOut": "Чиқиш",
      "header.save": "Сақлаш",
      "header.saving": "Сақланмоқда..."
    }
  },
  ru: {
    translation: {
      "dashboard.title": "Arxitektur",
      "dashboard.welcome": "Добро пожаловать",
      "dashboard.subtitle": "Продолжите с того места, где остановились, или начните новый дизайн.",
      "dashboard.newProject": "Новый проект",
      "dashboard.initializing": "Инициализация...",
      "dashboard.noProjects": "Пока нет проектов",
      "dashboard.emptyState": "Ваше рабочее пространство пусто. Создайте свой первый архитектурный шедевр, чтобы начать.",
      "header.dashboard": "Главная",
      "header.signOut": "Выйти",
      "header.save": "Сохранить",
      "header.saving": "Сохранение..."
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
