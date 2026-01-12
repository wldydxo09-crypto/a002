import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryDashboard from './components/InventoryDashboard';
import HistoryList from './components/HistoryList';
import WriteModal from './components/WriteModal';
import SubMenuSettingsManager from './components/SubMenuSettingsManager';
import styles from './App.module.css';
import { useModalBack } from './hooks/useModalBack';

// Mock User for Assignment
const USER = {
  uid: "696452ae01251ca9866c4d5e",
  email: "student@example.com",
  displayName: "Student",
  photoURL: null
};

export default function App() {
  // const [loading, setLoading] = useState(false);
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Write Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeInitialMenu, setWriteInitialMenu] = useState('work');
  useModalBack(isWriteModalOpen, () => setIsWriteModalOpen(false));

  // History Filter State
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState<{ query: string; timestamp: number }>({ query: '', timestamp: 0 });
  const [historyLabel, setHistoryLabel] = useState<string | null>(null);

  // Work Menus State
  const [workMenus, setWorkMenus] = useState<{ id: string; name: string; icon: string }[]>([
    { id: 'work', name: '업무 일지', icon: '📝' },
    { id: 'dev', name: '개발 노트', icon: '💻' },
    { id: 'meeting', name: '회의/일정', icon: '📅' },
    { id: 'issue', name: '이슈/버그', icon: '🐛' },
    { id: 'idea', name: '아이디어', icon: '💡' },
  ]);

  // Load Menus
  useEffect(() => {
    const saved = localStorage.getItem('my_work_menus');
    if (saved) {
      try { setWorkMenus(JSON.parse(saved)); } catch (e) { }
    }
  }, []);

  // const saveWorkMenus = (newMenus: typeof workMenus) => {
  //   setWorkMenus(newMenus);
  //   localStorage.setItem('my_work_menus', JSON.stringify(newMenus));
  // };

  const handleOpenWrite = (menuId: string = 'work') => {
    setWriteInitialMenu(menuId);
    setIsWriteModalOpen(true);
  };

  const handleNavigateToHistory = (
    filter: 'all' | 'pending' | 'in-progress' | 'completed',
    searchQuery?: string,
    label?: string | null
  ) => {
    setHistoryFilter(filter);
    setHistoryLabel(label || null);
    if (searchQuery !== undefined) setHistorySearchQuery({ query: searchQuery, timestamp: Date.now() });
    setCurrentMenu('history');
  };

  const menuTitle = workMenus.find(m => m.id === currentMenu)?.name ||
    (currentMenu === 'dashboard' ? '대시보드' :
      currentMenu === 'inventory' ? '기능 보관함' :
        currentMenu === 'history' ? '전체 이력' : 'Smart Assistant');

  return (
    <div className={styles.layout}>
      <Sidebar
        currentMenu={currentMenu}
        onMenuChange={(menuId) => {
          setHistorySearchQuery({ query: '', timestamp: Date.now() }); // Clear Search
          setHistoryLabel(null); // Clear Label
          setCurrentMenu(menuId);
        }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenWrite={() => handleOpenWrite()}
        workMenus={workMenus}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={USER}
        onSearch={(q) => {
          setHistorySearchQuery({ query: q, timestamp: Date.now() });
          setCurrentMenu('history');
        }}
        onTagSelect={(tag) => {
          setHistoryLabel(tag);
          setCurrentMenu('history');
        }}
      />

      <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ''}`}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileOpen(true)}
            >
              ☰
            </button>
            <h2 className={styles.headerTitle}>{menuTitle}</h2>
          </div>
          {/* + New Record button removed as per user request (redundant with Sidebar) */}
        </header>

        <div className={styles.content}>
          {currentMenu === 'dashboard' && (
            <Dashboard
              userId={USER.uid}
              onOpenWrite={handleOpenWrite}
              onNavigateToHistory={handleNavigateToHistory}
            />
          )}

          {currentMenu === 'inventory' && (
            <InventoryDashboard userId={USER.uid} />
          )}

          {(currentMenu === 'history' || workMenus.some(m => m.id === currentMenu)) && (
            <HistoryList
              userId={USER.uid}
              menuId={workMenus.some(m => m.id === currentMenu) ? currentMenu : undefined}
              initialFilter={historyFilter}
              initialSearchQuery={historySearchQuery}
              initialLabel={historyLabel}
            />
          )}

          {currentMenu === 'settings' && (
            <SubMenuSettingsManager
              workMenus={workMenus}
              userId={USER.uid}
            />
          )}
        </div>
      </main>

      <WriteModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        initialMenuId={writeInitialMenu}
        userId={USER.uid}
      />
    </div>
  );
}
