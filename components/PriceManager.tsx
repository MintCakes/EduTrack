import React, { useState } from 'react';
import { Lock, Unlock, AlertTriangle, ShieldCheck, Plus, CheckCircle, Copy, Trash2 } from 'lucide-react';
import { PriceRule } from '../types';

interface PriceManagerProps {
  priceRules: PriceRule[];
  setPriceRules: React.Dispatch<React.SetStateAction<PriceRule[]>>;
}

const PriceManager: React.FC<PriceManagerProps> = ({ priceRules, setPriceRules }) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(priceRules.find(r => r.isActive)?.id || priceRules[0].id);

  const selectedRule = priceRules.find(r => r.id === selectedRuleId) || priceRules[0];

  const handleCreateNew = () => {
    // Create immediately without prompt to ensure UI responsiveness
    const newName = `新价格体系 ${new Date().toLocaleDateString()}`;
    const newRule: PriceRule = {
      ...selectedRule,
      id: crypto.randomUUID(),
      name: newName,
      isActive: false,
      isLocked: false, // Default to unlocked
      createdAt: new Date().toISOString()
    };
    setPriceRules(prev => [...prev, newRule]);
    setSelectedRuleId(newRule.id);
  };

  const handleUpdate = (field: keyof PriceRule, value: any) => {
    // Check lock status, but allow unlocking (updating 'isLocked') and setting active status
    if (selectedRule.isLocked && field !== 'isActive' && field !== 'isLocked') return;
    
    setPriceRules(prev => prev.map(r => 
      r.id === selectedRuleId ? { ...r, [field]: value } : r
    ));
  };

  const toggleLock = () => {
    handleUpdate('isLocked', !selectedRule.isLocked);
  };

  const setAsActive = () => {
    if (!window.confirm("确定要将此价格体系设为当前生效吗？这将影响所有默认计算。")) return;
    setPriceRules(prev => prev.map(r => ({
      ...r,
      isActive: r.id === selectedRuleId
    })));
  };

  const handleDelete = (id: string) => {
      const rule = priceRules.find(r => r.id === id);
      if (!rule) return;
      
      if (rule.isActive) {
          alert("无法删除当前生效的规则。");
          return;
      }

      if (!window.confirm(`确定要删除价格体系 "${rule.name}" 吗？此操作无法撤销。`)) return;
      
      const newRules = priceRules.filter(r => r.id !== id);
      setPriceRules(newRules);
      
      // If we deleted the selected rule, select the first available one
      if (selectedRuleId === id) {
          setSelectedRuleId(newRules[0]?.id || '');
      }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-fade-in-up">
      {/* Sidebar List */}
      <div className="xl:w-80 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">版本列表</h2>
              <button 
                onClick={handleCreateNew}
                className="p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors shadow-md"
                title="新建版本"
              >
                  <Plus size={20}/>
              </button>
          </div>
          
          <div className="space-y-3">
              {priceRules.map(rule => (
                  <div key={rule.id} className="relative group">
                    <button
                        onClick={() => setSelectedRuleId(rule.id)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden pr-12 ${
                            selectedRuleId === rule.id 
                            ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-50' 
                            : 'bg-white border-zinc-100 hover:border-zinc-300'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`font-bold truncate ${selectedRuleId === rule.id ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                {rule.name}
                            </span>
                            {rule.isActive && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span>{new Date(rule.createdAt).toLocaleDateString()}</span>
                            {rule.isLocked && <Lock size={12} />}
                        </div>
                        {selectedRuleId === rule.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}
                    </button>
                    
                    {!rule.isActive && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(rule.id);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all z-10"
                            title="删除此版本"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                  </div>
              ))}
          </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
            <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                    <input 
                        type="text" 
                        value={selectedRule.name}
                        disabled={selectedRule.isLocked}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        placeholder="点击输入规则名称"
                        className={`text-2xl font-bold text-zinc-900 bg-transparent outline-none border-b-2 border-transparent transition-colors w-full ${selectedRule.isLocked ? 'cursor-not-allowed' : 'hover:border-emerald-200 focus:border-emerald-500'}`}
                    />
                    {selectedRule.isActive && <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold whitespace-nowrap">当前生效</span>}
                 </div>
                 <p className="text-zinc-500 text-sm">ID: {selectedRule.id.substring(0,8)}...</p>
            </div>
            
            <div className="flex gap-2">
                {!selectedRule.isActive && (
                    <button
                        onClick={setAsActive}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    >
                        <CheckCircle size={16}/> 设为生效
                    </button>
                )}
                <button
                    onClick={toggleLock}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedRule.isLocked 
                        ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                >
                    {selectedRule.isLocked ? <><Lock size={16}/> 已锁定</> : <><Unlock size={16}/> 编辑中</>}
                </button>
                 {!selectedRule.isActive && (
                    <button
                        onClick={() => handleDelete(selectedRule.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                        <Trash2 size={16}/> 删除
                    </button>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chinese Pricing Card */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2 flex items-center gap-2">
                    语文小班
                </h3>
                <p className="text-sm text-zinc-400 mb-8">独立计费，不参与多科联报折扣体系。</p>
                
                <div className="bg-zinc-50 p-6 rounded-2xl flex items-center justify-between group-hover:bg-rose-50/30 transition-colors">
                    <span className="font-semibold text-zinc-700">课时单价</span>
                    <div className="flex items-center gap-1">
                        <span className="text-zinc-400 text-lg">¥</span>
                        <input
                            type="number"
                            disabled={selectedRule.isLocked}
                            value={selectedRule.chinesePrice}
                            onChange={e => handleUpdate('chinesePrice', Number(e.target.value))}
                            className={`w-24 text-3xl font-bold text-right bg-transparent border-b-2 ${selectedRule.isLocked ? 'border-transparent text-zinc-800' : 'border-rose-300 text-rose-600 focus:border-rose-500'} outline-none transition-all`}
                        />
                    </div>
                </div>
            </div>

            {/* Non-Chinese Pricing Card */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2 flex items-center gap-2">
                    非语文科目 (物/化/数/英)
                </h3>
                <p className="text-sm text-zinc-400 mb-6">价格基于学生所报科目总数量。</p>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                        <span className="text-zinc-600 font-medium">1 - 2 科</span>
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-400">¥</span>
                            <input
                                type="number"
                                disabled={selectedRule.isLocked}
                                value={selectedRule.nonChineseBasePrice}
                                onChange={e => handleUpdate('nonChineseBasePrice', Number(e.target.value))}
                                className={`w-16 text-xl font-bold text-right bg-transparent border-b-2 ${selectedRule.isLocked ? 'border-transparent' : 'border-zinc-200 focus:border-blue-500'} outline-none`}
                            />
                        </div>
                    </div>
                    
                    <div className="bg-blue-50/50 p-4 rounded-2xl space-y-4 border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={14}/> 3 科联报优惠
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">新生价格</span>
                            <div className="flex items-center gap-1">
                                <span className="text-blue-400 text-xs">¥</span>
                                <input type="number" disabled={selectedRule.isLocked} value={selectedRule.nonChineseDiscountNew} onChange={e => handleUpdate('nonChineseDiscountNew', Number(e.target.value))} className="w-12 bg-transparent text-right font-bold text-blue-700 border-b border-blue-200 focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-600">老生价格</span>
                            <div className="flex items-center gap-1">
                                <span className="text-blue-400 text-xs">¥</span>
                                <input type="number" disabled={selectedRule.isLocked} value={selectedRule.nonChineseDiscountOld} onChange={e => handleUpdate('nonChineseDiscountOld', Number(e.target.value))} className="w-12 bg-transparent text-right font-bold text-blue-700 border-b border-blue-200 focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-zinc-600 font-medium">4 科及以上</span>
                        <div className="flex items-center gap-1">
                            <span className="text-zinc-400">¥</span>
                            <input
                                type="number"
                                disabled={selectedRule.isLocked}
                                value={selectedRule.nonChineseFourSubPrice}
                                onChange={e => handleUpdate('nonChineseFourSubPrice', Number(e.target.value))}
                                className={`w-16 text-xl font-bold text-right bg-transparent border-b-2 ${selectedRule.isLocked ? 'border-transparent' : 'border-zinc-200 focus:border-blue-500'} outline-none`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {!selectedRule.isLocked && (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl flex items-center gap-3 text-sm border border-amber-100 animate-pulse">
                <AlertTriangle size={18} />
                <span className="font-medium">注意: 尚未锁定。修改价格规则将影响所有引用此规则的结算单。</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default PriceManager;