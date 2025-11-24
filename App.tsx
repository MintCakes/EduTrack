import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StudentManager from './components/StudentManager';
import PriceManager from './components/PriceManager';
import RecordManager from './components/RecordManager';
import SettlementManager from './components/SettlementManager';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import StudentView from './components/StudentView';
import { MOCK_STUDENTS, INITIAL_PRICE_RULES } from './constants';
import { Student, ClassRecord, PriceRule } from './types';

interface AuthState {
  isAuthenticated: boolean;
  userType: 'admin' | 'guest' | null;
  credentials: any;
}

function App() {
  // 认证状态
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    credentials: null
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Persistence Wrapper
  const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    });
    useEffect(() => {
      window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);
    return [value, setValue];
  };

  const [students, setStudents] = useStickyState<Student[]>(MOCK_STUDENTS, 'et_students');
  const [records, setRecords] = useStickyState<ClassRecord[]>([], 'et_records');
  // Updated to store an array of PriceRules
  const [priceRules, setPriceRules] = useStickyState<PriceRule[]>(INITIAL_PRICE_RULES, 'et_price_rules_v2');

  // Identify the active rule for Dashboard default view
  const activePriceRule = priceRules.find(r => r.isActive) || priceRules[0];

  // 认证处理函数
  const handleLogin = (userType: 'admin' | 'guest', credentials: any) => {
    setAuth({
      isAuthenticated: true,
      userType,
      credentials
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      userType: null,
      credentials: null
    });
    setActiveTab('dashboard');
  };

  // 访客查看学生记录
  const handleViewStudent = (student: Student) => {
    setActiveTab('student-view');
  };

  // 访客返回主页面
  const handleBackToMain = () => {
    setActiveTab('dashboard');
  };

  // 如果未认证，显示登录页面
  if (!auth.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} students={students} />;
  }

  // 访客模式下直接显示学生查看页面
  if (auth.userType === 'guest' && auth.credentials?.student) {
    return (
      <StudentView 
        student={auth.credentials.student}
        records={records.filter(r => r.studentId === auth.credentials.student.id)}
        onBack={handleLogout}
      />
    );
  }

  // 管理员模式渲染主应用内容
  const renderContent = () => {
    switch (activeTab) {
      case 'student-view':
        // 管理员查看学生记录的入口（在侧边栏添加）
        return <Dashboard students={students} records={records} priceRule={activePriceRule} />;
      case 'dashboard':
        return <Dashboard students={students} records={records} priceRule={activePriceRule} />;
      case 'students':
        return <StudentManager students={students} setStudents={setStudents} />;
      case 'records':
        return <RecordManager students={students} records={records} setRecords={setRecords} />;
      case 'settlement':
        return <SettlementManager students={students} records={records} priceRules={priceRules} />;
      case 'pricing':
        return <PriceManager priceRules={priceRules} setPriceRules={setPriceRules} />;
      default:
        return <Dashboard students={students} records={records} priceRule={activePriceRule} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      userType={auth.userType}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;