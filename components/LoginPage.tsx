import React, { useState } from 'react';
import { GraduationCap, User, Lock, Phone, Search, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: (userType: 'admin' | 'guest', credentials: any) => void;
  students: Array<{ id: string; name: string; phone: string }>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, students }) => {
  const [loginType, setLoginType] = useState<'admin' | 'guest'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  const [guestCredentials, setGuestCredentials] = useState({
    searchType: 'phone' as 'phone' | 'name',
    value: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    if (!adminCredentials.username || !adminCredentials.password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    // 模拟登录验证
    setTimeout(() => {
      if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin') {
        onLogin('admin', { username: 'admin' });
      } else {
        setError('用户名或密码错误');
      }
      setLoading(false);
    }, 1000);
  };

  const handleGuestLogin = () => {
    if (!guestCredentials.value) {
      setError('请输入学生手机号或姓名');
      return;
    }

    setLoading(true);
    setError('');

    // 验证学生信息
    setTimeout(() => {
      let student = null;
      
      if (guestCredentials.searchType === 'phone') {
        student = students.find(s => s.phone.includes(guestCredentials.value));
      } else {
        student = students.find(s => s.name.toLowerCase().includes(guestCredentials.value.toLowerCase()));
      }

      if (student) {
        onLogin('guest', { student });
      } else {
        setError('未找到对应的学生信息');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">EduTrack</h1>
          <p className="text-zinc-500 mt-2">课程结算管理系统</p>
        </div>

        {/* Login Type Toggle */}
        <div className="bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setLoginType('admin')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                loginType === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <User size={16} />
              管理员登录
            </button>
            <button
              onClick={() => setLoginType('guest')}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                loginType === 'guest'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <Search size={16} />
              访客访问
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {loginType === 'admin' ? (
            // Admin Login Form
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">用户名</label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                    placeholder="请输入用户名"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">密码</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                    placeholder="请输入密码"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    验证中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </div>
          ) : (
            // Guest Login Form
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">查找方式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGuestCredentials(prev => ({ ...prev, searchType: 'phone', value: '' }))}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      guestCredentials.searchType === 'phone'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <Phone size={16} />
                    手机号
                  </button>
                  <button
                    onClick={() => setGuestCredentials(prev => ({ ...prev, searchType: 'name', value: '' }))}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      guestCredentials.searchType === 'name'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    <User size={16} />
                    姓名
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700">
                  {guestCredentials.searchType === 'phone' ? '学生手机号' : '学生姓名'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestCredentials.value}
                    onChange={(e) => setGuestCredentials(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                    placeholder={guestCredentials.searchType === 'phone' ? '请输入手机号' : '请输入学生姓名'}
                  />
                  {guestCredentials.searchType === 'phone' ? (
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  ) : (
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                  )}
                </div>
              </div>

              <button
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    查找中...
                  </>
                ) : (
                  '查询学生信息'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-zinc-400">
          <p>© 2024 EduTrack Pro. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;