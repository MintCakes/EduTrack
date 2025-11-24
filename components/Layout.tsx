import React, { ReactNode, useState } from 'react';
import { BookOpen, Users, DollarSign, PieChart, Calculator, GraduationCap, LogOut, User, Key, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import PasswordChangeModal from './PasswordChangeModal';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  userType?: 'admin' | 'guest' | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, userType }) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('admin123'); // 默认管理员密码
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: '数据概览', icon: <PieChart size={20} /> },
    { id: 'students', label: '学生档案', icon: <Users size={20} /> },
    { id: 'records', label: '课时记录', icon: <BookOpen size={20} /> },
    { id: 'settlement', label: '费用结算', icon: <Calculator size={20} /> },
    { id: 'pricing', label: '价格体系', icon: <DollarSign size={20} /> },
  ];

  const handlePasswordChange = (newPassword: string) => {
    setAdminPassword(newPassword);
    // 这里可以添加密码变更成功的通知
    console.log('密码已成功修改');
  };

  const handleNavClick = (tab: string) => {
    onTabChange(tab);
    // 移动端点击导航后自动关闭菜单
    setIsMobileMenuOpen(false);
  };

  // 移动端下拉菜单
  const renderMobileMenu = () => (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="p-3 border-b border-zinc-200 bg-white flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-lg shadow-emerald-200">
            <GraduationCap size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900">EduTrack</h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">PRO VERSION</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
        >
          <X size={20} className="text-zinc-600" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="bg-white border-b border-zinc-200 p-3">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`group flex items-center gap-2.5 px-3 py-3 rounded-xl w-full transition-all duration-200 ease-in-out ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                {React.cloneElement(item.icon, { size: 16 })}
              </span>
              <span className="text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile User Section */}
      <div className="bg-white p-3 space-y-3">
        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl p-3 text-white shadow-xl shadow-zinc-200">
          <div className="flex items-center gap-2 mb-2">
            <User size={14} />
            <span className="text-xs font-medium">
              {userType === 'admin' ? '管理员' : '访客'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 mb-1">系统状态</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium">运行正常</span>
          </div>
        </div>

        {/* Password Change Button (Admin Only) */}
        {userType === 'admin' && (
          <button
            onClick={() => {
              setShowPasswordModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors font-medium"
          >
            <Key size={14} />
            <span className="text-sm">修改密码</span>
          </button>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors font-medium"
          >
            <LogOut size={14} />
            <span className="text-sm">退出登录</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            {renderMobileMenu()}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex bg-white flex-shrink-0 h-screen sticky top-0 z-50 shadow-sm border-r border-zinc-200 flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64 lg:w-72'
      }`}>
        {/* Header */}
        <div className={`${isCollapsed ? 'p-3' : 'p-6 lg:p-8 pb-4'} transition-all duration-300`}>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-emerald-200 flex-shrink-0">
              <GraduationCap size={18} className="sm:w-6 lg:w-6" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg lg:text-xl font-bold tracking-tight text-zinc-900">
                  EduTrack
                </h1>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-medium tracking-wide">PRO VERSION</p>
              </div>
            )}
            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`ml-auto p-1.5 sm:p-2 hover:bg-zinc-100 rounded-md sm:rounded-lg transition-colors ${isCollapsed ? 'w-full flex justify-center' : ''}`}
              title={isCollapsed ? '展开菜单' : '折叠菜单'}
            >
              {isCollapsed ? <ChevronRight size={16} className="sm:w-5 lg:w-5" /> : <ChevronLeft size={16} className="sm:w-5 lg:w-5" />}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 px-4 py-5 space-y-2 overflow-y-auto no-scrollbar">
          {!isCollapsed && (
            <p className="px-4 text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">主菜单</p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex items-center transition-all duration-200 ease-in-out ${
                isCollapsed 
                  ? 'px-3 py-3 rounded-xl justify-center' 
                  : 'px-3 lg:px-4 py-3 rounded-xl w-full'
              } ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`}>
                {React.cloneElement(item.icon, { size: 16 })}
              </span>
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
              {!isCollapsed && activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* User Info & Logout */}
        <div className={`${isCollapsed ? 'p-3' : 'p-4 lg:p-6'} border-t border-zinc-100 space-y-3 lg:space-y-4`}>
          {/* User Info */}
          <div className={`bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl lg:rounded-2xl text-white shadow-xl shadow-zinc-200 ${
            isCollapsed ? 'p-2.5' : 'p-3 lg:p-4'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <User size={14} className="lg:w-4 lg:h-4" />
              {!isCollapsed && (
                <span className="text-xs lg:text-sm font-medium">
                  {userType === 'admin' ? '管理员' : '访客'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <>
                <p className="text-[10px] lg:text-xs text-zinc-400 mb-1">系统状态</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2 lg:h-2.5 lg:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 lg:h-2.5 lg:w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs lg:text-sm font-medium">运行正常</span>
                </div>
              </>
            )}
          </div>

          {/* Password Change Button (Admin Only) */}
          {userType === 'admin' && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 lg:px-4 lg:py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl lg:rounded-2xl transition-colors font-medium ${
                isCollapsed ? 'justify-center px-2.5' : ''
              }`}
              title={isCollapsed ? '修改密码' : ''}
            >
              <Key size={14} className="lg:w-4.5 lg:h-4.5" />
              {!isCollapsed && <span className="text-sm">修改密码</span>}
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center gap-2 px-3 py-2.5 lg:px-4 lg:py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl lg:rounded-2xl transition-colors font-medium ${
                isCollapsed ? 'justify-center px-2.5' : ''
              }`}
              title={isCollapsed ? '退出登录' : ''}
            >
              <LogOut size={14} className="lg:w-4.5 lg:h-4.5" />
              {!isCollapsed && <span className="text-sm">退出登录</span>}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-zinc-200 p-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-lg shadow-emerald-200">
            <GraduationCap size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900">EduTrack</h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wide">PRO VERSION</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors"
        >
          <Menu size={20} className="text-zinc-600" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pb-24">
          <div className="page-enter">
            {children}
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {userType === 'admin' && (
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onPasswordChange={handlePasswordChange}
          currentPassword={adminPassword}
        />
      )}
    </div>
  );
};

export default Layout;