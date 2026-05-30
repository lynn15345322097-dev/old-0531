/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  User, 
  Smartphone, 
  Info, 
  Sliders, 
  Sparkles, 
  Volume2, 
  Heart,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { MuseumItem, FamilyInfo } from './types';
import { INITIAL_MUSEUM_ITEMS, DEFAULT_FAMILY_INFO } from './data';
import { 
  PageHome, 
  PageMuseum, 
  PageMine, 
  PageBinding, 
  PageUpload, 
  PageDetail 
} from './components/WeChatPages';

export default function App() {
  // Database local states
  const [items, setItems] = useState<MuseumItem[]>(() => {
    const saved = localStorage.getItem('ldx_museum_items');
    return saved ? JSON.parse(saved) : INITIAL_MUSEUM_ITEMS;
  });

  const [familyInfo, setFamilyInfo] = useState<FamilyInfo>(() => {
    const saved = localStorage.getItem('ldx_family_info');
    return saved ? JSON.parse(saved) : DEFAULT_FAMILY_INFO;
  });

  // Simulator routing states
  // 'home' | 'museum' | 'mine' | 'binding' | 'upload' | 'detail'
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentPageParams, setCurrentPageParams] = useState<any>({ itemId: 'item-1' });

  // Sync state modifications with localStorage
  useEffect(() => {
    localStorage.setItem('ldx_museum_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('ldx_family_info', JSON.stringify(familyInfo));
  }, [familyInfo]);

  // Handle in-app internal navigation
  const handleNavigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setCurrentPageParams(params);
  };

  // Helper: Reset database to initial pristine setup for easy re-runs
  const resetDemoDatabase = () => {
    setItems(INITIAL_MUSEUM_ITEMS);
    setFamilyInfo(DEFAULT_FAMILY_INFO);
    setCurrentPage('home');
    setCurrentPageParams({ itemId: 'item-1' });
  };

  // Retrieve current active title in WeChat Mini Program Header
  const getHeaderTitle = () => {
    switch (currentPage) {
      case 'home':
        return '老东西';
      case 'museum':
        return '我的家庭博物馆';
      case 'mine':
        return '我的';
      case 'binding':
        return '家庭身份绑定';
      case 'upload':
        return '上传新物品';
      case 'detail': {
        const item = items.find(i => i.id === currentPageParams?.itemId);
        return item ? item.title : '藏品档案';
      }
      default:
        return '老东西';
    }
  };

  // Map the bottom tab highlight index to the current active primary screens
  const getActiveTab = () => {
    if (currentPage === 'home') return 0;
    if (currentPage === 'museum') return 1;
    if (currentPage === 'mine') return 2;
    return -1; // tab bar is hidden on subpages
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2a221d] flex flex-col items-center py-6 md:py-10 px-4 selection:bg-[#aa7d54]/25 selection:text-[#2a221d]">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[320px] bg-linear-to-b from-[#f0ebd8]/40 to-transparent pointer-events-none" />

      {/* Main Container Dual-Column Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* ================================================================= */}
        {/* LEFT PANEL: PROJECT INTRODUCTION & INTERACTIVE DEMO CONTROLLER  */}
        {/* ================================================================= */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col space-y-6">
          
          {/* Cover & Brand card */}
          <div className="bg-white border border-[#eae3d5] p-6 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="absolute right-4 top-4 bg-[#fbf4ea] text-brand-bronze text-xs font-serif-sc font-medium px-2.5 py-1 rounded-sm border border-[#f0ebd5]">
              MVP 演示系统
            </div>
            
            <p className="text-sm font-mono tracking-widest text-[#aa7d54] uppercase font-bold">Product Showcase</p>
            <h1 className="text-3xl font-serif-sc font-extrabold text-[#1f1a17] tracking-tight mt-1.5 flex items-baseline gap-1.5">
              老东西
              <span className="text-sm font-normal text-brand-bluegray font-sans select-none">— 那些没有被丢掉的东西</span>
            </h1>
            
            <p className="text-xs text-[#6e6051] mt-3 leading-relaxed font-serif-sc border-l-2 border-[#aa7d54] pl-3">
              这是一个帮助家庭成员一起修复旧物记忆、重叙三代情谊的微信小程序。
              长辈指尖上的斑驳老记忆，不该随破铜烂铁一同积灰。
            </p>

            <div className="mt-5 pt-4 border-t border-[#f5efe1] flex flex-wrap gap-2 text-[11px] text-[#63574b]">
              <span className="bg-[#fcfbf9] border border-[#e2dcd0] px-2 py-0.5 rounded-sm">🎨 极简主义家庭博物馆</span>
              <span className="bg-[#fcfbf9] border border-[#e2dcd0] px-2 py-0.5 rounded-sm">📜 记忆重组接龙</span>
              <span className="bg-[#fcfbf9] border border-[#e2dcd0] px-2 py-0.5 rounded-sm">🎙️ 长辈原声录制</span>
            </div>
          </div>

          {/* Core Feature Deep Links / Shortcuts Panel */}
          <div className="bg-white border border-[#eae3d5] p-6 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#faf7f2] pb-2">
              <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5 uppercase font-serif-sc">
                <Sliders className="w-3.5 h-3.5 text-brand-bronze" />
                Demo 快速进入通道 (Deep Links)
              </span>
              <button 
                onClick={resetDemoDatabase}
                className="text-[10px] text-brand-bronze hover:underline flex items-center gap-1 font-mono font-bold"
                title="重置数据库到全新出厂状态"
              >
                <RefreshCw className="w-3 h-3" />
                重置测试数据
              </button>
            </div>

            <p className="text-[11px] text-[#8c8071] leading-relaxed">
              为了完美测试小程序 MVP 中规定的 <strong>6 个页面</strong> 与 <strong>藏品详情页 3 种状态</strong>，您可以通过此面板一键热切换模拟器画面：
            </p>

            <div className="space-y-2.5">
              
              {/* Section 1: Standard Tab View */}
              <div className="space-y-1">
                <p className="text-[10px] text-brand-bluegray font-bold font-serif-sc uppercase tracking-wider">▲ 小程序主栏目 (Tab Pages)</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleNavigate('home')} 
                    className={`text-xs py-2 px-1 text-center font-serif-sc border rounded-lg transition-all ${currentPage === 'home' ? 'bg-brand-dark text-brand-beige border-brand-dark' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    1. 首页推荐
                  </button>
                  <button 
                    onClick={() => handleNavigate('museum')} 
                    className={`text-xs py-2 px-1 text-center font-serif-sc border rounded-lg transition-all ${currentPage === 'museum' ? 'bg-brand-dark text-brand-beige border-brand-dark' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    2. 博物馆
                  </button>
                  <button 
                    onClick={() => handleNavigate('mine')} 
                    className={`text-xs py-2 px-1 text-center font-serif-sc border rounded-lg transition-all ${currentPage === 'mine' ? 'bg-brand-dark text-brand-beige border-brand-dark' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    3. 我的档案
                  </button>
                </div>
              </div>

              {/* Section 2: Specialty / Single Action Screens */}
              <div className="space-y-1 pt-1.5">
                <p className="text-[10px] text-brand-bluegray font-bold font-serif-sc uppercase tracking-wider">▲ 首次注册与物件创建 (Creation)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleNavigate('binding')} 
                    className={`text-xs py-2 px-2 text-center font-serif-sc border rounded-lg transition-all ${currentPage === 'binding' ? 'bg-brand-dark text-brand-beige border-brand-dark' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    4. 家庭身份绑定页
                  </button>
                  <button 
                    onClick={() => handleNavigate('upload')} 
                    className={`text-xs py-2 px-2 text-center font-serif-sc border rounded-lg transition-all ${currentPage === 'upload' ? 'bg-brand-dark text-brand-beige border-brand-dark' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    5. 上传新藏品页
                  </button>
                </div>
              </div>

              {/* Section 3: Detail Screen States (Core Test Cases) */}
              <div className="space-y-1 pt-1.5">
                <p className="text-[10px] text-brand-bronze font-extrabold font-serif-sc uppercase tracking-wider">★ 藏品详情页 3 种修复状态 (Detail States)</p>
                <div className="space-y-1.5">
                  
                  {/* Shortcut State A */}
                  <button 
                    onClick={() => {
                      // Force No.001 back into Restoring state for state A demo
                      const restoredNo001: MuseumItem & any = items.find(i => i.id === 'item-1')!;
                      if (restoredNo001 && restoredNo001.state !== 'restoring') {
                        setItems(items.map(i => i.id === 'item-1' ? { ...i, state: 'restoring', restoration: 20 } : i));
                      }
                      handleNavigate('detail', { itemId: 'item-1' });
                    }} 
                    className={`w-full text-left text-xs py-2 px-3 border rounded-lg flex items-center justify-between transition-all ${currentPage === 'detail' && items.find(i => i.id === currentPageParams?.itemId)?.state === 'restoring' ? 'bg-[#ebf3fc] text-[#204052] border-brand-bluegray font-semibold' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-serif-sc font-medium">状态 A：极简黑白修复中 (20%)</span>
                      <span className="text-[9px] text-[#707c8a] font-serif-sc">物件呈黑白模糊态，可通过对答、补充话语提升完好度</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Shortcut State B */}
                  <button 
                    onClick={() => {
                      // Force No.002 to be Pending Card for state B demo
                      const currentNo002 = items.find(i => i.id === 'item-2')!;
                      if (currentNo002 && currentNo002.state !== 'pending_card') {
                        setItems(items.map(i => i.id === 'item-2' ? { ...i, state: 'pending_card', restoration: 100 } : i));
                      }
                      handleNavigate('detail', { itemId: 'item-2' });
                    }} 
                    className={`w-full text-left text-xs py-2 px-3 border rounded-lg flex items-center justify-between transition-all ${currentPage === 'detail' && items.find(i => i.id === currentPageParams?.itemId)?.state === 'pending_card' ? 'bg-[#fcf5eb] text-brand-bronze border-brand-bronze/70 font-semibold' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-serif-sc font-medium">状态 B：拼合完毕，未生成展品卡 (100%)</span>
                      <span className="text-[9px] text-[#8e7a68] font-serif-sc">影像破除尘封变清晰。一键启动精装卡片合拢装裱</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  {/* Shortcut State C */}
                  <button 
                    onClick={() => {
                      // Force No.003 to be fully exhibited for state C demo
                      handleNavigate('detail', { itemId: 'item-3' });
                    }} 
                    className={`w-full text-left text-xs py-2 px-3 border rounded-lg flex items-center justify-between transition-all ${currentPage === 'detail' && items.find(i => i.id === currentPageParams?.itemId)?.state === 'exhibited' ? 'bg-brand-dark text-brand-beige border-brand-dark font-semibold' : 'bg-brand-beige/30 hover:bg-[#eae3d5]/30'}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-serif-sc font-medium">状态 C：已生成馆藏展签 (Exhibited Card)</span>
                      <span className="text-[9px] opacity-80 font-serif-sc">温暖厚重的博物馆式木托卡签，展示记忆岁月谱系</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                </div>
              </div>

            </div>
          </div>

          {/* Aesthetics & Design Principles block */}
          <div className="bg-white border border-[#eae3d5] p-5 rounded-2xl shadow-xs space-y-3.5">
            <span className="text-xs font-bold text-brand-dark flex items-center gap-1.5 uppercase font-serif-sc">
              <Sparkles className="w-4 h-4 text-brand-bronze" />
              设计美学规范 (Applet Guidelines)
            </span>
            
            <div className="text-xs text-[#6e6051] space-y-2.5 leading-relaxed font-serif-sc">
              <p>
                <strong>配色选用：</strong>以温暖安宁、富有年代感的 <span className="text-[#a49987] font-semibold">米白 (#faf7f2)</span> 和 <span className="text-[#6c6152] font-semibold">暖灰</span> 为底色，烘托家族博物馆的名签厚重感。搭配古朴的 <span className="text-brand-bronze font-bold">铜色 (#aa7d54)</span> 以及温和的 <span className="text-brand-bluegray font-bold">蓝灰</span> 作为关键节点强调，去糟粕、凝厚重。
              </p>
              <p>
                <strong>高辨识度控件：</strong>针对高龄长辈优化，按钮目标大、对白文字清明。排版回归古典纸质文献与宣纸标签比例，让长者和后代在摩挲老故事时倍感沉淀。
              </p>
            </div>
            
            <div className="border-t border-[#fbf9f5] pt-3 flex items-center justify-between text-[11px] text-[#938b7e]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emeral-500" />
                无缝数据同步 (Auto-Sync)
              </span>
              <span>数据自动缓存于 LocalStorage</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT PANEL: SMARTPHONE WECHAT MINI PROGRAM EMULATOR             */}
        {/* ================================================================= */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full max-w-[390px] relative">
            
            {/* Visual indicators for phone wrapper */}
            <div className="absolute -left-10 top-1/4 h-20 w-1.5 bg-[#d2c9b9]/60 rounded-r-lg hidden xl:block" />
            <div className="absolute -left-10 top-[40%] h-14 w-1.5 bg-[#d2c9b9]/60 rounded-r-lg hidden xl:block" />
            <div className="absolute -right-10 top-1/3 h-28 w-1.5 bg-[#d2c9b9]/60 rounded-l-lg hidden xl:block" />

            {/* Simulated iPhone chassis frame */}
            <div className="w-full aspect-[9/18.8] bg-[#1e1b18] rounded-[48px] p-2.5 shadow-2xl border-4 border-[#3e3833] flex flex-col overflow-hidden relative select-none ring-1 ring-white/10">
              
              {/* iPhone Ear Speaker / Sensor notch pill */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#1e1b18] z-55 rounded-full flex items-center justify-center">
                <div className="w-10 h-1 bg-[#2e2b28] rounded-full mr-4" />
                <div className="w-2.5 h-2.5 bg-[#151c2f] rounded-full border border-white/10" />
              </div>

              {/* iPhone Liquid Retina Screen Canvas wrapper */}
              <div className="w-full h-full bg-brand-beige rounded-[38px] overflow-hidden flex flex-col relative border border-black/40">
                
                {/* 1. iOS + WECHAT STATUS BAR */}
                <div className="bg-white h-11 pt-5 px-6 flex items-center justify-between text-[#1f1a17] text-xs font-semibold select-none z-50">
                  <span>18:05</span>
                  {/* WeChat miniature connection states on Top Right */}
                  <div className="flex items-center gap-1.5">
                    {/* Signal status bars */}
                    <div className="flex items-end gap-0.5 h-2.5 w-3.5">
                      <div className="w-0.5 h-[30%] bg-brand-dark rounded-sm" />
                      <div className="w-0.5 h-[55%] bg-brand-dark rounded-sm" />
                      <div className="w-0.5 h-[80%] bg-brand-dark rounded-sm" />
                      <div className="w-0.5 h-full bg-brand-dark rounded-sm" />
                    </div>
                    {/* Wifi indicator icon mock */}
                    <span className="text-[10px]">5G</span>
                    {/* Battery container */}
                    <div className="w-5 h-2.5 border border-brand-dark/80 rounded-xs p-0.5 flex items-center">
                      <div className="h-full bg-brand-dark rounded-2xs w-[90%]" />
                    </div>
                  </div>
                </div>

                {/* 2. WECHAT MINI PROGRAM NAVIGATION TITLE BLOCK */}
                <div className="bg-white h-11 border-b border-[#f5efe1] px-4 flex items-center justify-between text-[#1f1a17] relative select-none z-50">
                  {/* Left region: Back chevron if in subpages, else branding name */}
                  <div className="flex items-center gap-1 min-w-[70px]">
                    {['binding', 'upload', 'detail'].includes(currentPage) ? (
                      <button 
                        onClick={() => {
                          if (currentPage === 'detail' && currentPageParams?.origin === 'museum') {
                            handleNavigate('museum');
                          } else {
                            handleNavigate('home');
                          }
                        }}
                        className="p-1 -ml-1 rounded-full hover:bg-brand-gray/50 active:scale-90 transition-all flex items-center text-xs font-bold font-serif-sc text-brand-bronze"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                        <span>返回</span>
                      </button>
                    ) : (
                      <span className="text-[#a49987] text-xs font-bold tracking-widest font-serif-sc">老东西</span>
                    )}
                  </div>

                  {/* Center branding or dynamic header */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                    <span className="text-sm font-serif-sc font-bold tracking-wider text-[#1e1a17]">
                      {getHeaderTitle()}
                    </span>
                  </div>

                  {/* Right: Iconic WeChat Mini-Program Capsule Button Controls */}
                  <div className="flex items-center bg-brand-beige border border-[#e6e1d5] rounded-full py-1.5 px-3 whitespace-nowrap select-none">
                    {/* Triple dots button & exit outline circles */}
                    <div className="flex gap-1.5 items-center cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/90" />
                      <span className="w-2 h-2 rounded-full bg-brand-dark/90" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/90" />
                    </div>
                    {/* Divider vertical gap */}
                    <div className="w-px h-3.5 bg-brand-dark/20 mx-2.5" />
                    {/* Simulated exit handle button circle */}
                    <div className="w-3.5 h-3.5 border-2 border-brand-dark/90 rounded-full flex items-center justify-center cursor-pointer">
                      <div className="w-1.5 h-1.5 bg-brand-dark/90 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* 3. SCROLLABLE SCREEN CONTENT AREA */}
                <div className="flex-1 overflow-y-auto bg-brand-beige mini-program-screen relative">
                  
                  {currentPage === 'home' && (
                    <PageHome 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                    />
                  )}

                  {currentPage === 'museum' && (
                    <PageMuseum 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                      currentPageParams={currentPageParams}
                    />
                  )}

                  {currentPage === 'mine' && (
                    <PageMine 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                    />
                  )}

                  {currentPage === 'binding' && (
                    <PageBinding 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                    />
                  )}

                  {currentPage === 'upload' && (
                    <PageUpload 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                    />
                  )}

                  {currentPage === 'detail' && (
                    <PageDetail 
                      items={items} 
                      setItems={setItems} 
                      familyInfo={familyInfo} 
                      setFamilyInfo={setFamilyInfo} 
                      onNavigate={handleNavigate} 
                      currentPageParams={currentPageParams}
                    />
                  )}

                </div>

                {/* 4. WECHAT BOTTOM TAB NAVIGATION BAR BAR */}
                {/* Rules dictate showing only in three main anchor pages */}
                {getActiveTab() !== -1 && (
                  <div className="bg-white h-[68px] border-t border-[#f5efe1] pt-1.5 pb-3 px-6 flex justify-around items-center select-none z-50">
                    
                    {/* Tab index 0: 首页 */}
                    <button 
                      id="tab-home"
                      onClick={() => handleNavigate('home')}
                      className={`flex flex-col items-center flex-1 cursor-pointer transition-all ${getActiveTab() === 0 ? 'text-brand-bronze scale-[1.03]' : 'text-[#827a70] opacity-80'}`}
                    >
                      <Home className="w-5 h-5 mt-0.5" />
                      <span className="text-[10px] font-semibold mt-1 font-serif-sc">首页</span>
                    </button>

                    {/* Tab index 1: 博物馆 */}
                    <button 
                      id="tab-museum"
                      onClick={() => handleNavigate('museum', { filter: 'all' })}
                      className={`flex flex-col items-center flex-1 cursor-pointer transition-all ${getActiveTab() === 1 ? 'text-brand-bronze scale-[1.03]' : 'text-[#827a70] opacity-80'}`}
                    >
                      <BookOpen className="w-5 h-5 mt-0.5" />
                      <span className="text-[10px] font-semibold mt-1 font-serif-sc">博物馆</span>
                    </button>

                    {/* Tab index 2: 我的 */}
                    <button 
                      id="tab-mine"
                      onClick={() => handleNavigate('mine')}
                      className={`flex flex-col items-center flex-1 cursor-pointer transition-all ${getActiveTab() === 2 ? 'text-brand-bronze scale-[1.03]' : 'text-[#827a70] opacity-80'}`}
                    >
                      <User className="w-5 h-5 mt-0.5" />
                      <span className="text-[10px] font-semibold mt-1 font-serif-sc">我的</span>
                    </button>

                  </div>
                )}

                {/* iPhone bar-shaped tactile home indicator bottom */}
                <div className="bg-white h-3.5 w-full flex items-center justify-center select-none">
                  <div className="w-32 h-[4px] bg-brand-dark/40 rounded-full" />
                </div>

              </div>

            </div>

            {/* Simulated smartphone base shadow */}
            <div className="w-4/5 h-6 bg-[#000000]/15 dark:bg-[#000000]/30 rounded-full filter blur-xl mx-auto mt-4" />

          </div>
          
        </div>

      </div>

    </div>
  );
}
