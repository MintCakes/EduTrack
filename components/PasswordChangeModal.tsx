import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Key } from 'lucide-react';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (newPassword: string) => void;
  currentPassword: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onPasswordChange,
  currentPassword
}) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    const newErrors: string[] = [];

    if (!passwords.current) {
      newErrors.push('请输入当前密码');
    } else if (passwords.current !== currentPassword) {
      newErrors.push('当前密码不正确');
    }

    if (!passwords.new) {
      newErrors.push('请输入新密码');
    } else if (passwords.new.length < 4) {
      newErrors.push('新密码长度至少为4位');
    }

    if (!passwords.confirm) {
      newErrors.push('请确认新密码');
    } else if (passwords.new !== passwords.confirm) {
      newErrors.push('两次输入的新密码不一致');
    }

    if (passwords.new === passwords.current) {
      newErrors.push('新密码不能与当前密码相同');
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validatePasswords();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    // 模拟异步保存操作
    setTimeout(() => {
      onPasswordChange(passwords.new);
      setLoading(false);
      
      // 重置表单
      setPasswords({
        current: '',
        new: '',
        confirm: ''
      });
      
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    setPasswords({
      current: '',
      new: '',
      confirm: ''
    });
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Key size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">修改密码</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-rose-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">当前密码</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                  placeholder="请输入当前密码"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">新密码</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                  placeholder="请输入新密码（至少4位）"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-zinc-700">确认新密码</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full border border-zinc-200 p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-zinc-50 focus:bg-white"
                  placeholder="请再次输入新密码"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  保存中...
                </>
              ) : (
                '保存密码'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;