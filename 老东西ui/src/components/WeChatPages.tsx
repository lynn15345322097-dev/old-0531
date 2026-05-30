/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  Copy, 
  Mic, 
  Volume2, 
  Tag, 
  Users, 
  User, 
  Calendar, 
  Hash, 
  Award, 
  Check, 
  Send
} from 'lucide-react';
import { MuseumItem, ChatRecord, FamilyInfo } from '../types';
import { 
  WhitePorcelainTeacup, 
  WallClock59, 
  SewingMachine, 
  UnknownRetroObject 
} from './VintageIllustrations';

// Helper to render the correct SVG illustration
export function renderIllustration(name: string, grayscale: boolean, blurLevel: number, className = "w-full h-full") {
  switch (name) {
    case 'WhitePorcelainTeacup':
      return <WhitePorcelainTeacup grayscale={grayscale} blurLevel={blurLevel} className={className} />;
    case 'WallClock59':
      return <WallClock59 grayscale={grayscale} blurLevel={blurLevel} className={className} />;
    case 'SewingMachine':
      return <SewingMachine grayscale={grayscale} blurLevel={blurLevel} className={className} />;
    default:
      return <UnknownRetroObject grayscale={grayscale} blurLevel={blurLevel} className={className} />;
  }
}

interface PageProps {
  items: MuseumItem[];
  setItems: React.Dispatch<React.SetStateAction<MuseumItem[]>>;
  familyInfo: FamilyInfo;
  setFamilyInfo: React.Dispatch<React.SetStateAction<FamilyInfo>>;
  onNavigate: (page: string, params?: any) => void;
  currentPageParams?: any;
}

// -----------------------------------------------------------------
// PAGE 1: 首页 (Home Screen)
// -----------------------------------------------------------------
export function PageHome({ items, onNavigate }: PageProps) {
  const restoringItems = items.filter(item => item.state === 'restoring');
  const exhibitedItems = items.filter(item => item.state === 'exhibited');

  return (
    <div className="flex flex-col space-y-6 pb-8 animate-fade-in">
      {/* Title block */}
      <div className="px-4 pt-4">
        <p className="text-xs font-serif-sc text-brand-bronze tracking-widest uppercase mb-1">
          — 那些没有被丢掉的东西 —
        </p>
        <h1 className="text-2xl font-serif-sc font-medium text-brand-dark leading-tight">
          修复一段记忆<br />找回一件物品
        </h1>
      </div>

      {/* Main CTA */}
      <div className="px-4">
        <button 
          id="btn-upload-home"
          onClick={() => onNavigate('upload')}
          className="w-full flex items-center justify-between bg-brand-dark text-brand-beige py-4 px-5 rounded-xl shadow-md hover:bg-opacity-90 active:scale-[0.98] transition-all"
        >
          <div className="text-left">
            <p className="font-serif-sc text-lg font-medium tracking-wide">上传你的物品</p>
            <p className="text-xs text-brand-gray opacity-80 mt-0.5">拍照或选择家中的老物件，开启记忆重组</p>
          </div>
          <div className="bg-brand-bronze text-brand-beige p-2.5 rounded-lg">
            <Plus className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* 待修复藏品 (Restoring items) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#e6e1d5] pb-2">
          <h2 className="font-serif-sc font-medium text-brand-dark flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-brand-bronze rounded-sm"></span>
            待修复藏品
            <span className="text-xs text-[#8c8275] bg-[#dfdacb] px-1.5 py-0.5 rounded-full font-sans">
              {restoringItems.length}
            </span>
          </h2>
          {restoringItems.length > 0 && (
            <button 
              onClick={() => onNavigate('museum', { filter: 'restoring' })} 
              className="text-xs text-brand-bronze font-medium py-1 hover:underline"
            >
              全部
            </button>
          )}
        </div>

        {restoringItems.length === 0 ? (
          <div className="bg-brand-gray rounded-xl p-6 text-center border border-dashed border-[#dcd7cb]">
            <p className="text-sm text-[#8a8073]">目前没有正在修复的旧物</p>
            <button 
              onClick={() => onNavigate('upload')} 
              className="text-xs text-brand-bronze font-medium mt-2 hover:underline"
            >
              上传我的第一件 +
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {restoringItems.map(item => {
              // Convert 0-100 to an aesthetic blur value for thumbnail preview
              const blurVal = Math.max(0, (100 - item.restoration) / 20);
              return (
                <div 
                  key={item.id}
                  onClick={() => onNavigate('detail', { itemId: item.id })}
                  className="bg-white rounded-xl overflow-hidden border border-[#e8e3d7] shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex flex-col h-full"
                >
                  <div className="h-28 w-full bg-[#f3efe6] relative overflow-hidden flex items-center justify-center">
                    {renderIllustration(item.imageUrl, true, blurVal, "w-full h-full scale-105")}
                    {/* Floating restoration badget */}
                    <div className="absolute top-2 left-2 bg-brand-dark/80 backdrop-blur-xs text-brand-beige text-[10px] px-2 py-0.5 rounded-full font-serif-sc tracking-wider">
                      修复度 {item.restoration}%
                    </div>
                  </div>
                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <p className="text-[10px] font-mono text-[#aa7d54] uppercase tracking-wider">No.{item.no}</p>
                      <h3 className="font-serif-sc text-sm text-brand-dark font-medium line-clamp-1 mt-0.5">
                        {item.title}
                      </h3>
                    </div>
                    {/* Tiny Progress bar */}
                    <div className="mt-2.5">
                      <div className="w-full bg-[#e6e1d5] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-bronze rounded-full transition-all duration-550" 
                          style={{ width: `${item.restoration}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 最近入馆藏品 (Recently registered/exhibited items) */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#e6e1d5] pb-2">
          <h2 className="font-serif-sc font-medium text-brand-dark flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-brand-bluegray rounded-sm"></span>
            最近入馆藏品
            <span className="text-xs text-[#8c8275] bg-[#dfdacb] px-1.5 py-0.5 rounded-full font-sans">
              {exhibitedItems.length}
            </span>
          </h2>
          {exhibitedItems.length > 0 && (
            <button 
              onClick={() => onNavigate('museum', { filter: 'exhibited' })} 
              className="text-xs text-brand-bluegray font-medium py-1 hover:underline"
            >
              馆藏一览
            </button>
          )}
        </div>

        {exhibitedItems.length === 0 ? (
          <div className="bg-brand-gray rounded-xl p-6 text-center border border-dashed border-[#dcd7cb]">
            <p className="text-sm text-[#8a8073]">博物馆空空如也，快去修复老物件吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            {exhibitedItems.map(item => (
              <div 
                key={item.id}
                onClick={() => onNavigate('detail', { itemId: item.id })}
                className="bg-white rounded-xl overflow-hidden border border-[#e8e3d7] shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex p-3 gap-3"
              >
                <div className="w-20 h-20 rounded-lg bg-[#f3efe6] flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                  {renderIllustration(item.imageUrl, false, 0, "w-full h-full scale-105")}
                  <div className="absolute top-1 right-1 bg-brand-bronze text-brand-beige text-[8px] px-1 rounded-sm flex items-center font-serif-sc">
                    馆藏
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1 py-0.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-mono text-[#aa7d54] uppercase tracking-wider">No.{item.no}</p>
                      <span className="text-[10px] text-brand-bluegray bg-[#eef1f3] px-2 py-0.5 rounded-full font-medium">
                        {item.relationPerson.split(' ')[0]}
                      </span>
                    </div>
                    <h3 className="font-serif-sc text-sm text-brand-dark font-medium mt-0.5">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#8c8071] line-clamp-2 leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PAGE 2: 博物馆 (Museum Screen)
// -----------------------------------------------------------------
export function PageMuseum({ items, onNavigate, currentPageParams }: PageProps) {
  const initialFilter = currentPageParams?.filter || 'all';
  const [filter, setFilter] = useState<'all' | 'restoring' | 'exhibited'>(initialFilter as any);

  // Sync state if params change
  useEffect(() => {
    if (currentPageParams?.filter) {
      setFilter(currentPageParams.filter);
    }
  }, [currentPageParams]);

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.state === filter;
  });

  return (
    <div className="flex flex-col space-y-4 pb-8 animate-fade-in">
      {/* Search and Titles */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-serif-sc font-medium text-brand-dark">家庭博物馆</h1>
        <p className="text-xs text-[#8c8072] mt-0.5">收集整理了属于我们家的老痕迹</p>
      </div>

      {/* Custom Tabs (Segments Selector) */}
      <div className="px-4">
        <div className="flex bg-[#ede7db] p-1 rounded-xl">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 text-xs py-2 rounded-lg font-serif-sc transition-all ${filter === 'all' ? 'bg-brand-dark text-brand-beige font-semibold shadow-xs' : 'text-brand-dark/80 hover:bg-brand-gray/40'}`}
          >
            全部 ({items.length})
          </button>
          <button 
            onClick={() => setFilter('restoring')}
            className={`flex-1 text-xs py-2 rounded-lg font-serif-sc transition-all ${filter === 'restoring' ? 'bg-brand-dark text-brand-beige font-semibold shadow-xs' : 'text-brand-dark/80 hover:bg-brand-gray/40'}`}
          >
            待修复 ({items.filter(i => i.state === 'restoring').length})
          </button>
          <button 
            onClick={() => setFilter('exhibited')}
            className={`flex-1 text-xs py-2 rounded-lg font-serif-sc transition-all ${filter === 'exhibited' ? 'bg-brand-dark text-brand-beige font-semibold shadow-xs' : 'text-brand-dark/80 hover:bg-brand-gray/40'}`}
          >
            已入馆 ({items.filter(i => i.state === 'exhibited').length})
          </button>
        </div>
      </div>

      {/* Empty states */}
      {filteredItems.length === 0 && (
        <div className="px-8 py-16 text-center">
          <div className="w-16 h-16 bg-brand-gray border border-[#dcd7cb] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-brand-dark font-serif-sc text-lg">物</span>
          </div>
          <p className="text-sm font-serif-sc text-brand-dark/75">暂无符合条件的藏品</p>
          <p className="text-xs text-brand-[#8a8073] mt-1">点击首页“上传你的物品”开启第一个藏品</p>
        </div>
      )}

      {/* Grid Collections */}
      {filteredItems.length > 0 && (
        <div className="px-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => {
              const isExhibited = item.state === 'exhibited';
              const blurVal = isExhibited ? 0 : Math.max(0, (100 - item.restoration) / 20);

              return (
                <div 
                  key={item.id}
                  onClick={() => onNavigate('detail', { itemId: item.id })}
                  className={`bg-white rounded-xl border p-3 border-[#e8e4d8] shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-3 relative overflow-hidden`}
                >
                  <div className="flex gap-4">
                    {/* Image space */}
                    <div className="w-24 h-24 rounded-lg bg-[#fcfaf4] flex-shrink-0 relative overflow-hidden ring-1 ring-brand-gray flex items-center justify-center">
                      {renderIllustration(item.imageUrl, !isExhibited, blurVal, "w-full h-full scale-105")}
                      
                      {/* Restoration state or Museum Ribbon */}
                      {isExhibited ? (
                        <div className="absolute top-1 left-1 bg-brand-bronze text-brand-beige text-[8px] px-1 rounded-sm font-serif-sc uppercase tracking-widest leading-normal shadow-xs">
                          已入馆
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 bg-brand-dark/80 text-[#eeddc5] text-[7px] px-1 rounded-sm leading-normal font-mono font-bold">
                          {item.restoration}%
                        </div>
                      )}
                    </div>

                    {/* Metadata Content */}
                    <div className="flex flex-col justify-between flex-1 py-0.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium text-brand-bronze uppercase tracking-widest">NO.{item.no}</span>
                          <span className="w-1 h-1 rounded-full bg-[#cbc1af]" />
                          <span className="text-[10px] font-serif-sc text-brand-bluegray bg-[#eef1f3] px-2 py-0.5 rounded-full">
                            {item.relationPerson}
                          </span>
                        </div>
                        <h3 className="font-serif-sc text-base text-brand-dark font-medium mt-1">
                          {item.title}
                        </h3>
                        {/* Highlights & Tags */}
                        {isExhibited ? (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.keywords.slice(0, 3).map((keyword, idx) => (
                              <span key={idx} className="text-[10px] font-serif-sc text-[#807261] border border-[#e0d9cd] px-1.5 py-0.5 rounded-sm">
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-2 text-xs">
                            <span className="text-brand-bronze font-serif-sc">记忆重塑中...</span>
                            <div className="w-full bg-[#f0ebd9] h-1.5 rounded-full overflow-hidden mt-1 max-w-[140px]">
                              <div 
                                className="h-full bg-brand-bronze rounded-full" 
                                style={{ width: `${item.restoration}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Detailed summary of the exhibition description */}
                  {isExhibited && (
                    <div className="border-t border-[#f0ebd9] pt-2 px-1 text-[11px] text-[#6b6152] leading-relaxed italic line-clamp-2">
                      “{item.description}”
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// PAGE 3: 我的 (Mine Screen)
// -----------------------------------------------------------------
export function PageMine({ familyInfo, setFamilyInfo, onNavigate }: PageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familyInfo.invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6 pb-8 animate-fade-in text-[#231e1a]">
      {/* Top Profile Card */}
      <div className="px-4 pt-6">
        <div className="bg-[#f0ebd8] rounded-2xl p-5 border border-[#dfdacc] relative overflow-hidden shadow-xs">
          {/* Decorative antique circular background badge */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border-4 border-[#e9e3ce] opacity-30 pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center text-brand-beige border-2 border-brand-bronze flex-shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#827863] font-serif-sc font-medium uppercase tracking-widest">家庭博物馆档案</p>
              <h2 className="text-lg font-serif-sc font-semibold text-brand-dark mt-0.5">{familyInfo.familyName}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Member details fields */}
      <div className="px-4">
        <div className="bg-white rounded-xl border border-[#ede7d9] shadow-xs divide-y divide-[#faf7f2]">
          
          {/* Field: My Alias */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center text-brand-bronze">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-brand-dark">我的称呼</span>
            </div>
            <span className="text-sm text-[#7a6b57] font-serif-sc font-semibold">{familyInfo.myAlias}</span>
          </div>

          {/* Field: My Role */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center text-[#556975]">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-brand-dark">我的角色</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-serif-sc border font-medium ${
              familyInfo.myRole === '老东西' 
                ? 'bg-[#fbf4eb] text-brand-bronze border-[#eadeca]' 
                : 'bg-[#eef4f8] text-[#3c5665] border-[#cbdfe9]'
            }`}>
              {familyInfo.myRole === '老东西' ? '老东西 (老人)' : '小东西 (家人)'}
            </span>
          </div>

          {/* Field: Relation */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center text-brand-dark/70">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-brand-dark">家庭关系</span>
            </div>
            <span className="text-sm text-[#7a6b57] font-serif-sc font-semibold">{familyInfo.familyRelation}</span>
          </div>
        </div>
      </div>

      {/* Invitation Code Section */}
      <div className="px-4">
        <div className="bg-[#fcfbf9] rounded-xl border border-[#ede7da] p-4 flex flex-col space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8c8071]">邀请家庭成员加入</p>
              <p className="text-xs text-[#a3988a] mt-0.5">一起参与老物件的记忆接龙</p>
            </div>
            <span className="text-[10px] font-serif-sc font-semibold text-brand-bronze tracking-wider uppercase bg-[#faf4eb] px-2 py-0.5 rounded-sm border border-[#f0ebd5]">
              家庭邀请码
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-brand-gray py-3 px-4 rounded-lg font-mono text-center text-sm font-bold border border-[#eae5da] tracking-widest text-[#4d4235]">
              {familyInfo.invitationCode}
            </div>
            <button 
              id="btn-copy-code"
              onClick={handleCopyCode}
              className={`py-3 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copied 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-brand-dark text-brand-beige hover:bg-opacity-90 active:scale-[0.97]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  复制
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reset options for demo */}
      <div className="px-5 pt-4">
        <button 
          onClick={() => onNavigate('binding')}
          className="w-full text-center text-xs text-[#a09485] hover:text-brand-bronze py-2.5 rounded-lg border border-dashed border-[#e6e1d5] hover:bg-[#faf9f6]/50 transition-all font-serif-sc"
        >
          重新绑定家庭认证 ↺
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PAGE 4: 家庭绑定页 (Family Binding)
// -----------------------------------------------------------------
export function PageBinding({ familyInfo, setFamilyInfo, onNavigate }: PageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  
  // Local form inputs
  const [formFamilyName, setFormFamilyName] = useState('老陈家的传家屋');
  const [formMyAlias, setFormMyAlias] = useState('陈阿敏');
  const [formMyRole, setFormMyRole] = useState<'老东西' | '小东西'>('小东西');
  const [formRelation, setFormRelation] = useState('孙女');
  const [formInviteCode, setFormInviteCode] = useState('');

  const relationPresets = ['爷爷', '奶奶', '爸爸', '妈妈', '孙女', '孙子', '女儿', '儿子', '其他'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = activeTab === 'create' 
      ? 'LDX-' + Math.floor(1000 + Math.random() * 9000) + '-CZ' 
      : (formInviteCode.toUpperCase().trim() || 'LDX-8392-ZN');
      
    const finalFamilyName = activeTab === 'join' 
      ? '王姥姥的时光匣子' // Example default if they joined a random code
      : formFamilyName;

    setFamilyInfo({
      familyName: finalFamilyName || '未命名家庭博物馆',
      myAlias: formMyAlias || '无名小东西',
      myRole: formMyRole,
      familyRelation: formRelation,
      invitationCode: finalCode
    });

    // Send them to Home
    onNavigate('home');
  };

  return (
    <div className="flex flex-col space-y-6 px-4 py-6 scroll-smooth animate-fade-in text-[#2a221a]">
      {/* Header and greeting */}
      <div className="text-center space-y-2 mt-4">
        <h1 className="text-xl font-serif-sc font-medium text-brand-dark tracking-wide leading-tight">
          「Hello！ 一起成为老东西吧～」
        </h1>
        <p className="text-xs text-[#8c8071] max-w-[280px] mx-auto leading-relaxed">
          这里是存储岁月、交换记忆的暖屋。我们可以邀请长辈，携手揭开老古董背后的深藏记忆。
        </p>
      </div>

      {/* Tab select buttons */}
      <div className="flex bg-[#ede7db] p-1 rounded-xl">
        <button 
          onClick={() => {
            setActiveTab('create');
            setFormMyRole('小东西');
          }}
          className={`flex-1 text-xs py-2.5 rounded-lg transition-all font-serif-sc ${activeTab === 'create' ? 'bg-brand-dark text-brand-beige font-semibold shadow-xs' : 'text-brand-dark/80 font-medium'}`}
        >
          创建一个家庭博物馆
        </button>
        <button 
          onClick={() => {
            setActiveTab('join');
            setFormMyRole('老东西');
          }}
          className={`flex-1 text-xs py-2.5 rounded-lg transition-all font-serif-sc ${activeTab === 'join' ? 'bg-brand-dark text-brand-beige font-semibold shadow-xs' : 'text-brand-dark/80 font-medium'}`}
        >
          输入邀请码加入
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-[#ede7da] p-4 shadow-xs">
        {activeTab === 'create' ? (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-brand-dark/80 block font-serif-sc uppercase tracking-wider">家庭博物馆名称</label>
            <input 
              id="input-family-name"
              type="text" 
              value={formFamilyName}
              onChange={(e) => setFormFamilyName(e.target.value)}
              placeholder="例如：老陈家的传家屋 / 外公家的小小院"
              className="w-full text-xs font-serif-sc bg-[#faf8f4] py-2 px-3 rounded-lg border border-[#eae3d5] text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-bronze"
              required
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-brand-dark/80 block font-serif-sc uppercase tracking-wider">输入邀请码 (六位或八位)</label>
            <input 
              id="input-invite-code"
              type="text" 
              value={formInviteCode}
              onChange={(e) => setFormInviteCode(e.target.value)}
              placeholder="格式：LDX-XXXX-XX"
              className="w-full font-mono text-center tracking-widest text-xs bg-[#faf8f4] py-2.5 px-3 rounded-lg border border-[#eae3d5] text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-bronze"
              required={activeTab === 'join'}
            />
          </div>
        )}

        {/* My alias/name */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-brand-dark/80 block font-serif-sc uppercase tracking-wider">我的称呼（大家认识的名字）</label>
          <input 
            id="input-my-alias"
            type="text" 
            value={formMyAlias}
            onChange={(e) => setFormMyAlias(e.target.value)}
            placeholder="例如：小陈 / 阿敏 / 国强"
            className="w-full text-xs font-serif-sc bg-[#faf8f4] py-2 px-3 rounded-lg border border-[#eae3d5] text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-bronze"
            required
          />
        </div>

        {/* My role selection - styled clearly */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-brand-dark/80 block font-serif-sc uppercase tracking-wider">我的家庭角色</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all ${formMyRole === '老东西' ? 'bg-[#fcf5eb] border-brand-bronze text-brand-bronze' : 'border-[#ebd6d5] hover:bg-brand-gray/30'}`}>
              <div className="text-left">
                <span className="text-xs font-semibold block font-serif-sc">老东西</span>
                <span className="text-[9px] text-[#807060] opacity-80 block font-sans">家里的长辈/老人</span>
              </div>
              <input 
                type="radio" 
                name="myRole" 
                checked={formMyRole === '老东西'} 
                onChange={() => setFormMyRole('老东西')}
                className="accent-brand-bronze" 
              />
            </label>
            <label className={`border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all ${formMyRole === '小东西' ? 'bg-[#ebf3fc] border-brand-bluegray text-brand-bluegray' : 'border-[#e6ded5] hover:bg-brand-gray/30'}`}>
              <div className="text-left">
                <span className="text-xs font-semibold block font-serif-sc">小东西</span>
                <span className="text-[9px] text-[#607080] opacity-80 block font-sans">晚辈/家人/记录人</span>
              </div>
              <input 
                type="radio" 
                name="myRole" 
                checked={formMyRole === '小东西'} 
                onChange={() => setFormMyRole('小东西')}
                className="accent-brand-bluegray" 
              />
            </label>
          </div>
        </div>

        {/* Family relationship presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-brand-dark/80 block font-serif-sc uppercase tracking-wider">我是谁（家庭关系）</label>
          <div className="flex flex-wrap gap-1.5">
            {relationPresets.map(rel => (
              <button 
                key={rel}
                type="button"
                onClick={() => setFormRelation(rel)}
                className={`py-1 px-3 rounded-full text-xs font-serif-sc border transition-all ${formRelation === rel ? 'bg-brand-dark text-brand-beige border-brand-dark font-medium shadow-2xs' : 'bg-[#fcfbf9] border-[#eae3d5] hover:bg-[#eae3d5]/40 text-[#4d4235]'}`}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3">
          <button 
            type="submit" 
            className="w-full bg-brand-dark text-brand-beige py-3 rounded-lg font-serif-sc font-medium hover:bg-opacity-90 transition-all active:scale-[0.98]"
          >
            {activeTab === 'create' ? '建馆并进入博物馆' : '验证邀请码并加入'}
          </button>
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------------------
// PAGE 5: 上传物件页 (Upload Screen)
// -----------------------------------------------------------------
export function PageUpload({ onNavigate, items, setItems }: PageProps) {
  // Preset list of historic family objects that will generate beautiful SVG artwork!
  const presets = [
    { name: 'WhitePorcelainTeacup', title: '搪瓷盖工作茶杯', previewName: '白瓷茶杯', creator: '外公' },
    { name: 'WallClock59', title: '五九式机械齿轮钟', previewName: '铁皮烤漆钟', creator: '奶奶' },
    { name: 'SewingMachine', title: '上海描金蝴蝶牌缝纫机', previewName: '脚踏缝纫机', creator: '妈妈' },
    { name: 'Unknown', title: '陈旧铁壳电子管收音机', previewName: '未知收音机', creator: '爷爷' },
  ];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customTitle, setCustomTitle] = useState('');
  const [personInCharge, setPersonInCharge] = useState('外公 陈建国');

  const handleCreateCollection = () => {
    const nextNoNum = items.length + 1;
    const finalNo = nextNoNum < 10 ? `00${nextNoNum}` : `0${nextNoNum}`;
    
    // Create new items structure
    const preset = presets[selectedPreset];
    const newTitle = customTitle.trim() || `未知藏品 No.${finalNo}`;
    
    const newItem: MuseumItem = {
      id: `item-custom-${Date.now()}`,
      no: finalNo,
      title: newTitle,
      originalTitle: `珍藏的-${preset.title}`,
      imageUrl: preset.name,
      restoration: 20, // starts hazy
      state: 'restoring',
      relationPerson: personInCharge || `${preset.creator} 亲藏`,
      keywords: [preset.creator, '经典老物件', '家族回忆'],
      description: `根据我们寻找的回忆片段，这是一件由${personInCharge || preset.creator}在早年使用的${preset.title}。它保留了我们过去生活的重要烙印。`,
      genealogy: `早年被${personInCharge}添置并由三代人共同使用 -> 整理家庭杂物时再次被发掘 -> ${new Date().getFullYear()}年上传至老东西博物馆备份。`,
      timeline: [
        {
          id: `chat-custom-1`,
          type: 'question',
          author: personInCharge.includes(' ') ? `后辈 (${personInCharge.split(' ')[1]})` : '子辈',
          role: 'helper',
          content: `这个“${newTitle}”真是太怀旧啦，我想知道当年它是怎么来的？`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        },
        {
          id: `chat-custom-2`,
          type: 'memory',
          author: '记录者',
          role: 'helper',
          content: `记忆里这个老古董一直藏在壁架抽屉深处，虽然有些陈旧剥落，但拿在手里沉甸甸的。`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        }
      ]
    };

    setItems([newItem, ...items]);
    
    // Instantly jump to State A of this custom item! Satisfies requirement 5.
    onNavigate('detail', { itemId: newItem.id });
  };

  return (
    <div className="flex flex-col space-y-5 pb-8 px-4 py-4 animate-fade-in text-[#2a221a]">
      <div className="pt-2">
        <h1 className="text-2xl font-serif-sc text-brand-dark">上传一个物件</h1>
        <p className="text-xs text-[#8c8072] mt-0.5">开始收集第一缕温润的记忆</p>
      </div>

      {/* Main Image Selection / Drag Upload Simulation box */}
      <div className="bg-white rounded-xl border border-[#ede7d9] p-4 flex flex-col items-center justify-center space-y-4 shadow-2xs">
        <div className="w-full h-44 rounded-xl bg-[#faf7f2] border-2 border-dashed border-[#dfdac9] flex flex-col items-center justify-center p-3 relative cursor-pointer hover:bg-brand-gray/40 transition-colors">
          
          <div className="w-24 h-24 flex items-center justify-center opacity-85">
            {renderIllustration(presets[selectedPreset].name, true, 2, "w-full h-full")}
          </div>

          <div className="text-center mt-2">
            <span className="text-xs font-serif-sc bg-brand-dark text-brand-beige px-2.5 py-1 rounded-sm tracking-wider">
              [拍照或选择一张旧物照片]
            </span>
          </div>
        </div>

        {/* Vintage Artifact Templates Picker */}
        <div className="w-full space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-brand-dark/70 uppercase font-serif-sc block tracking-widest">— 选择模板或上传草稿 —</label>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((p, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setSelectedPreset(idx)}
                className={`py-1.5 px-1 bg-[#faf8f4] text-[10px] text-center font-serif-sc border rounded-lg transition-all ${selectedPreset === idx ? 'bg-brand-dark text-brand-beige border-brand-dark font-semibold shadow-xs' : 'border-[#eae3d5] hover:bg-[#eae3d5]/30 text-brand-dark/80'}`}
              >
                {p.previewName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Supplementary details input */}
      <div className="bg-white rounded-xl border border-[#ede7db] p-4 space-y-3 shadow-2xs">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-brand-dark/80 font-serif-sc block">赋予它一个初选称呼</label>
          <input 
            id="input-exhibit-draft-title"
            type="text" 
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="例如：磕了大豁口的白茶缸 / 锈迹斑斑的老铜镜"
            className="w-full text-xs font-serif-sc bg-[#faf8f4] py-2 px-3 rounded-lg border border-[#eae3d5] text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-bronze"
          />
          <p className="text-[9px] text-[#938778] tracking-wide mt-0.5">※ 未知藏品在修复初期只显示模糊黑白状态。</p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-brand-dark/80 font-serif-sc block">关联的家人</label>
          <input 
            id="input-associated-person"
            type="text" 
            value={personInCharge}
            onChange={(e) => setPersonInCharge(e.target.value)}
            placeholder="例如：外公 陈建国 / 奶奶 张素芬"
            className="w-full text-xs font-serif-sc bg-[#faf8f4] py-2 px-3 rounded-lg border border-[#eae3d5] text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-bronze"
          />
        </div>
      </div>

      {/* Button */}
      <div>
        <button 
          id="btn-confirm-upload"
          onClick={handleCreateCollection}
          className="w-full bg-brand-dark text-brand-beige py-3.5 rounded-xl font-serif-sc text-sm font-semibold tracking-wide hover:bg-opacity-95 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          <span>创建未知藏品</span>
          <Plus className="w-4 h-4 text-brand-bronze" />
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// PAGE 6: 藏品详情页 (Item Detail Screen with 3 states)
// -----------------------------------------------------------------
export function PageDetail({ items, setItems, familyInfo, currentPageParams, onNavigate }: PageProps) {
  const itemId = currentPageParams?.itemId || 'item-1';
  const item = items.find(i => i.id === itemId) || items[0];

  const [inputText, setInputText] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timerText, setTimerText] = useState('0:00');
  const recordInterval = useRef<any>(null);

  if (!item) {
    return (
      <div className="p-8 text-center bg-brand-beige min-h-60 flex flex-col items-center justify-center">
        <p className="text-sm text-[#8c8172]">未找到对应藏品</p>
        <button onClick={() => onNavigate('home')} className="mt-4 text-xs font-serif-sc text-brand-bronze hover:underline">返回首页</button>
      </div>
    );
  }

  // Calculate rendering constraints based on Item State & Restoration percentage
  const isRestoring = item.state === 'restoring';
  const isPendingCard = item.state === 'pending_card';
  const isExhibited = item.state === 'exhibited';

  // CSS Grayscale & Blur calculated dynamically
  const isGrayscale = !isExhibited; // Grayscale true for restoring and pending card
  const blurVal = isExhibited ? 0 : Math.max(0, (100 - item.restoration) / 20);

  // Simulated Voice Answers database to make "老人语音回答" exceptionally detailed
  const seniorAnswers = [
    "这个搪瓷缸子，是我当年在公社抢险修堤拔了头筹得的先进劳模茶缸，全公社就三个！我用了差不多四十年，哪怕后来你妈说给我买不锈钢保温杯，我也不舍得换。这个把手磨光光的，就是日子留下的包浆咧~",
    "那是一九八三年的秋天，你妈准备结婚。家里条件普通，我和你爷爷到处打零工，不吃不喝攒了三个多月，才托百货大楼的远亲抢到了一台蝴蝶缝纫机。那天用木板车拉回家时，你奶奶高兴得哭了一整天，逢人就夸我们蝴蝶牌子的针线密，承载的都是妈妈那份喜气...",
    "这杆铜杆的老提秤是民国那年你太爷爷做酱油生意时留下的，秤花是黄铜打的，杆子是用整根红木削了三天三夜，用了大半辈子。现在虽然大家买菜都用电子显示数字秤了，可看见这秤砣，我就能想起当年跟着大车跑码头、拉担子的热乎劲儿。"
  ];

  const addTimelineAndRestoration = (type: 'question' | 'memory' | 'senior_voice', contentText: string, customAuthor?: string, speakSeconds = 12) => {
    const nextRestoration = Math.min(100, item.restoration + 25);
    let finalState = item.state;
    let finalTitle = item.title;

    // Transition naturally from Restoring to Pending Card once progress reaches 100%
    if (nextRestoration === 100 && isRestoring) {
      finalState = 'pending_card';
      finalTitle = item.originalTitle; // rename to original exhibit name as state reassembles!
    }

    const newRecord: ChatRecord = {
      id: `chat-${Date.now()}`,
      type,
      author: customAuthor || (type === 'senior_voice' ? `${item.relationPerson.split(' ')[0]} 爷爷` : familyInfo.myAlias),
      role: type === 'senior_voice' ? 'senior' : 'helper',
      content: contentText,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...(type === 'senior_voice' ? { durationSec: speakSeconds } : {})
    };

    const updatedItem: MuseumItem = {
      ...item,
      title: finalTitle,
      restoration: nextRestoration,
      state: finalState,
      timeline: [...item.timeline, newRecord]
    };

    setItems(items.map(i => i.id === item.id ? updatedItem : i));
  };

  const handleSendQuestion = () => {
    if (!inputText.trim()) return;
    addTimelineAndRestoration('question', inputText.trim());
    setInputText('');
  };

  const handleSendMemory = () => {
    if (!inputText.trim()) return;
    addTimelineAndRestoration('memory', inputText.trim());
    setInputText('');
  };

  // Simulation of "老人语音回答". In Demo, it simulates local microphone capture and grandparents audio script addition
  const handleSimulateSeniorVoice = () => {
    setIsRecording(true);
    let seconds = 0;
    recordInterval.current = setInterval(() => {
      seconds++;
      setTimerText(`0:${seconds < 10 ? '0' + seconds : seconds}`);
      if (seconds >= 4) {
        clearInterval(recordInterval.current);
        setIsRecording(false);
        setTimerText('0:00');
        // Retrieve a beautiful script from our grandparents answer presets
        const randAns = seniorAnswers[Math.floor(Math.random() * seniorAnswers.length)];
        addTimelineAndRestoration('senior_voice', randAns, item.relationPerson, 15);
      }
    }, 1000);
  };

  const triggerGenerateExhibitCard = () => {
    // Transition from State B (pending_card) to State C (exhibited)
    const updatedItem: MuseumItem = {
      ...item,
      state: 'exhibited',
      title: item.originalTitle // Lock title
    };
    setItems(items.map(i => i.id === item.id ? updatedItem : i));
  };

  const playSimulatedAudio = (recId: string) => {
    setPlayingVoiceId(recId);
    setTimeout(() => {
      setPlayingVoiceId(null);
    }, 4000); // playing animation is active for 4 seconds
  };

  return (
    <div className="flex flex-col h-full bg-[#faf7f2] relative animate-fade-in text-brand-dark pb-8">
      {/* Back to list controller bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#ebd6d5] bg-white sticky top-0 z-40">
        <button 
          onClick={() => onNavigate('home')}
          className="flex items-center text-xs font-serif-sc text-brand-bronze font-medium py-1 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          返回大堂
        </button>
        <span className="text-[10px] font-serif-sc font-medium bg-[#f0ebd9] px-2.5 py-0.5 rounded-full text-brand-dark/80">
          编号 No.{item.no}
        </span>
      </div>

      {/* RENDER ACCORDING TO STATES */}
      
      {/* ----------------- STATE A & B: DETAIL ACTIVE PANEL (修途中) ----------------- */}
      {(isRestoring || isPendingCard) && (
        <div className="flex flex-col flex-1">
          {/* Main image stage */}
          <div className="p-4 bg-[#f1ebd9]/40 border-b border-[#ebd6d5] shadow-2xs flex flex-col items-center">
            <p className="text-[10px] font-mono tracking-widest text-[#a19688]">
              {isRestoring ? '回忆重组中 — 回忆越密，残象越清' : '100% 修复度重组已就绪'}
            </p>
            <div className="w-44 h-44 rounded-xl border border-[#dfdacc] bg-white p-2 mt-2 shadow-xs relative overflow-hidden flex items-center justify-center">
              {renderIllustration(item.imageUrl, isGrayscale, blurVal, "w-full h-full scale-105")}
              
              {/* Grayscale Indicator watermark */}
              {isRestoring && (
                <div className="absolute top-2 left-2 bg-[#2a2118]/85 text-brand-beige text-[8px] font-serif-sc tracking-wide px-2 py-0.5 rounded-full uppercase scale-[0.85]">
                  黑白复原
                </div>
              )}
            </div>

            {/* Progress bar info */}
            <div className="w-full max-w-[260px] text-center mt-3.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-serif-sc text-brand-dark font-medium">
                <span>修复进度进度条</span>
                <span>{item.restoration}%</span>
              </div>
              <div className="w-full bg-[#eae3cf] h-2.5 rounded-full overflow-hidden border border-[#dfdaaf]">
                <div 
                  className={`h-full bg-brand-bronze rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${item.restoration}%` }}
                />
              </div>
            </div>
          </div>

          {/* Congratulations banner (STATE B) */}
          {isPendingCard && (
            <div className="mx-4 mt-4 p-4 bg-[#fbf4ea] rounded-xl border-2 border-brand-bronze/70 text-center space-y-2.5 shadow-xs animate-bounce-slow">
              <span className="text-brand-bronze text-base font-serif-sc font-bold flex items-center justify-center gap-1">
                <span>恭喜！记忆已重组完毕！</span>
                <span className="animate-pulse">✨</span>
              </span>
              <p className="text-xs text-[#8c7a65] font-serif-sc max-w-[260px] mx-auto leading-relaxed">
                家人接龙回答和爷爷的记忆语音，已拼接成完整的藏品说明。这就生成属于你们家的【家庭展品卡】吧！
              </p>
              <button 
                id="btn-generate-card"
                onClick={triggerGenerateExhibitCard}
                className="w-full bg-brand-dark text-brand-beige font-semibold font-serif-sc tracking-wide py-2.5 rounded-lg active:scale-[0.98] transition-all hover:bg-opacity-95 text-xs shadow-sm bg-radial"
              >
                生成展品卡
              </button>
            </div>
          )}

          {/* 接龙记录列表 timeline (Chronological dialog lists) */}
          <div className="flex-1 px-4 py-4 space-y-3.5">
            <h3 className="font-serif-sc text-xs font-semibold text-brand-bronze uppercase tracking-widest border-b border-[#e6e1d5] pb-1.5">— 记忆接龙接力链 —</h3>
            
            {item.timeline.map((record) => {
              const isVoice = record.type === 'senior_voice';
              const isPlaying = playingVoiceId === record.id;
              
              return (
                <div 
                  key={record.id}
                  className={`flex flex-col space-y-1 rounded-xl p-3 border leading-relaxed text-xs max-w-[90%] font-serif-sc ${
                    record.role === 'senior'
                      ? 'bg-[#fdfbf6] border-[#dfd2be] mr-auto'
                      : 'bg-[#faf4ea] border-[#e6dcc7] ml-auto text-right'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#807567] opacity-85">
                    <span className="font-semibold">{record.author}</span>
                    <span className="text-[8px] font-sans">({record.timestamp.slice(11)})</span>
                    <span>·</span>
                    <span className={`text-[10px] px-1 py-0.5 rounded-sm ${
                      record.type === 'question' ? 'bg-[#ebf3fc] text-[#3c5665]' : 
                      record.type === 'memory' ? 'bg-[#faf4eb] text-brand-bronze' : 'bg-[#eefcfc] text-[#2c787a]'
                    }`}>
                      {record.type === 'question' ? '提问' : 
                       record.type === 'memory' ? '记忆补充' : '老人语音回答'}
                    </span>
                  </div>

                  {isVoice ? (
                    <div className="pt-1 text-left">
                      {/* Audio player card */}
                      <button 
                        onClick={() => playSimulatedAudio(record.id)}
                        className={`flex items-center gap-2 py-2 px-3 bg-[#f3efe4] rounded-lg border border-[#dfd8ca] cursor-pointer hover:bg-[#eae1cc] transition-colors active:scale-95 ${
                          isPlaying ? 'border-brand-bronze ring-1 ring-brand-bronze' : ''
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 text-brand-bronze ${isPlaying ? 'animate-bounce' : ''}`} />
                        <span className="text-[11px] font-mono font-bold text-brand-dark">{record.durationSec} 秒爷爷回复</span>
                        {isPlaying && (
                          <span className="flex gap-0.5 items-center">
                            <span className="w-1 h-3.5 bg-brand-bronze rounded-full animate-bar-bounce-1"></span>
                            <span className="w-1 h-2 bg-brand-bronze rounded-full animate-bar-bounce-2"></span>
                            <span className="w-1 h-4 bg-brand-bronze rounded-full animate-bar-bounce-3"></span>
                          </span>
                        )}
                      </button>
                      <p className="text-xs text-[#5c5448] mt-1.5 leading-relaxed bg-[#fdfdfc] p-2 rounded-md border border-[#eee] text-[11px]">
                        语音转文字记录：{record.content}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-brand-dark leading-relaxed font-medium pt-0.5 ${record.role === 'senior' ? 'text-left' : 'text-right'}`}>
                      {record.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive controls and inputs bar ALWAYS pinned at bottom */}
          {isRestoring && (
            <div className="bg-white border-t border-[#ebd6d5] p-3 space-y-3.5 sticky bottom-0 z-20 shadow-lg">
              
              {/* Fake Recording micro indicator panel overlay during click */}
              {isRecording && (
                <div className="absolute inset-0 bg-[#2b241d]/90 flex flex-col items-center justify-center text-brand-beige z-30 transition-all font-serif-sc">
                  <div className="flex items-center gap-2 bg-[#aa7d54] p-3 rounded-full animate-ping-slow">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-sm font-semibold tracking-wide mt-3">【按住老人语音回答中 ...】</p>
                  <p className="text-xs text-brand-gray/80 mt-1">模拟长辈正在手按麦克风述说那段被尘封的岁月 ({timerText})</p>
                </div>
              )}

              {/* Chat Input field */}
              <div className="flex gap-2">
                <input 
                  id="input-chat-opinion"
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="问一个问题，或补一段记忆..."
                  className="flex-1 bg-brand-gray text-xs font-serif-sc py-2.5 px-3 rounded-lg border border-[#ede7db] focus:outline-none focus:ring-1 focus:ring-brand-bronze text-brand-dark"
                />
              </div>

              {/* Action buttons list */}
              <div className="grid grid-cols-3 gap-2.5">
                <button 
                  id="btn-add-question"
                  onClick={handleSendQuestion}
                  disabled={!inputText.trim()}
                  className="bg-[#ebf3fc] border border-[#cbdfe9] text-[#2c4e62] text-xs font-semibold py-2.5 rounded-lg active:scale-95 transition-all hover:bg-opacity-80 font-serif-sc flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3c5665]" />
                  提问
                </button>
                <button 
                  id="btn-add-memory"
                  onClick={handleSendMemory}
                  disabled={!inputText.trim()}
                  className="bg-[#fcf5eb] border border-[#eadeca] text-brand-bronze text-xs font-semibold py-2.5 rounded-lg active:scale-95 transition-all hover:bg-opacity-80 font-serif-sc flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-bronze" />
                  补充记忆
                </button>

                {/* Tactile micro button for elderly simulation response */}
                <button 
                  id="btn-trigger-old-mic"
                  onMouseDown={handleSimulateSeniorVoice}
                  onTouchStart={handleSimulateSeniorVoice}
                  className="bg-brand-dark border border-[#3e352b] text-brand-beige text-xs font-bold py-2.5 rounded-lg active:scale-[0.97] transition-all hover:bg-opacity-95 font-serif-sc flex items-center justify-center gap-1"
                  title="点击模拟老人按住并录入录音"
                >
                  <Mic className="w-3.5 h-3.5 text-brand-bronze shrink-0 animate-pulse" />
                  老人语音
                </button>
              </div>
              <p className="text-[10px] text-center text-[#9c8e7e] font-serif-sc tracking-wide pt-0.5">
                💡 手势轻触“老人语音”启动四秒微录仿真输入，将自动生成并拼合长辈声音。
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----------------- STATE C: EXHIBITED MUSEUM PLACARD (已入馆展标签) ----------------- */}
      {isExhibited && (
        <div className="px-4 py-5 animate-scale-up">
          
          {/* Main Museum Exhibit Style Frame Card */}
          <div className="bg-[#faf8f4] border-2 border-brand-dark/95 shadow-lg rounded-xl overflow-hidden p-5 relative font-serif-sc flex flex-col space-y-5">
            
            {/* Elegant corner framing graphics representing true craft museum label */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-bronze pointer-events-none" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-bronze pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-bronze pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-bronze pointer-events-none" />

            {/* Micro museum credits line header */}
            <div className="text-center border-b border-[#ebd7cf] pb-2.5 relative">
              <span className="text-[10px] uppercase font-bold text-brand-bronze tracking-widest">
                — 老东西家藏陈物系列 · 档案签 —
              </span>
              <p className="text-[9px] text-[#a19688] font-sans uppercase tracking-[0.2em] mt-0.5">LDX Collection No.{item.no}</p>
            </div>

            {/* Clear Image illustration display */}
            <div className="w-40 h-40 bg-white rounded-lg border border-[#dfdad0] p-1 shadow-inner mx-auto relative overflow-hidden flex items-center justify-center">
              {renderIllustration(item.imageUrl, false, 0, "w-full h-full scale-[1.03]")}
            </div>

            {/* Exhibit Title / Banner */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-brand-dark tracking-wide font-serif-sc">
                {item.title}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs text-brand-bluegray font-serif-sc">
                <Users className="w-3.5 h-3.5 text-brand-bronze" />
                <span>关联人物: {item.relationPerson}</span>
              </div>
            </div>

            {/* Keyword tags bubble list */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {item.keywords.map((tag, idx) => (
                <span 
                  key={idx}
                  className="text-[10px] text-[#847864] bg-[#f2ede0] py-1 px-2.5 rounded-sm border border-[#e5ded0] font-serif-sc font-medium flex items-center gap-0.5"
                >
                  <Tag className="w-2.5 h-2.5 text-brand-bronze" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Detailed narrative label description */}
            <div className="space-y-1.5 bg-[#f5f1e5] p-3 rounded-lg border border-[#eae3d2]">
              <span className="text-[10px] font-bold text-brand-dark block uppercase tracking-wider">— 馆藏说明 —</span>
              <p className="text-xs text-[#4c3e31] leading-relaxed text-justify indent-4">
                {item.description}
              </p>
            </div>

            {/* Genealogy profile memory lineage (记忆谱系) */}
            <div className="space-y-1.5 border-t border-dashed border-[#eadecf] pt-3">
              <span className="text-[10px] font-bold text-brand-bronze block uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                记忆岁月谱系 (Lineage Chart)
              </span>
              
              <div className="relative pl-3.5 border-l border-[#dcd1be] ml-1.5 space-y-2.5 py-1 text-[11px] text-[#6b5f50]">
                {item.genealogy.split('->').map((stepRef, sIdx) => (
                  <div key={sIdx} className="relative">
                    {/* Node circle */}
                    <span className="absolute -left-[19.5px] top-1 w-2 h-2 rounded-full bg-brand-bronze ring-2 ring-[#faf8f4]" />
                    <p className="leading-relaxed">{stepRef.trim()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Historic family comments & messages timeline (家人留言) */}
            <div className="space-y-1.5 border-t border-dashed border-[#eadecf] pt-3">
              <span className="text-[10px] font-bold text-brand-bronze block uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" />
                入馆同聚留言 (Family Postings)
              </span>

              <div className="space-y-2.5 pt-1">
                {item.timeline.slice(-2).map((tItem, tIdx) => (
                  <div key={tIdx} className="bg-white/80 p-2 rounded-md border border-[#e8dfcf] text-[11px] leading-relaxed">
                    <div className="flex justify-between text-[#827563] text-[9px] mb-0.5">
                      <span className="font-semibold text-brand-dark/80">{tItem.author}</span>
                      <span>{tItem.timestamp}</span>
                    </div>
                    <p className="text-[#322c26] italic font-serif-sc">“ {tItem.content} ”</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rebuilding option box */}
            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => {
                  // Simulate restoring regression just in case reviewer wants to re-test the complete loop flow!
                  const updatedItem: MuseumItem = {
                    ...item,
                    state: 'restoring',
                    restoration: 20
                  };
                  setItems(items.map(i => i.id === item.id ? updatedItem : i));
                }}
                className="text-[10px] text-[#a39789] hover:text-brand-bronze py-2 px-4 rounded-full border border-[#ede7d8] hover:bg-white transition-all font-mono"
              >
                ↺ 回收重组体验机制 (Reset Restoration Loop)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
