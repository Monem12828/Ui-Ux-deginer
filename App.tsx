import React, { useState, useCallback, useEffect } from 'react';
import { MobileCanvas } from './components/MobileCanvas';
import { EditorPanel } from './components/EditorPanel';
import { GeminiService } from './services/gemini';
import { ScreenData, UIComponent, AppTheme } from './types';
import { INITIAL_SCREEN } from './constants';
import { 
  Sparkles, 
  Smartphone, 
  Download, 
  Moon, 
  Sun, 
  RefreshCw, 
  Upload, 
  Plus, 
  Layers
} from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<ScreenData>(INITIAL_SCREEN);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [brandName, setBrandName] = useState('');
  const [mood, setMood] = useState('Modern & Clean');
  const [isGenerating, setIsGenerating] = useState(false);
  const [theme, setTheme] = useState<AppTheme>(AppTheme.DARK);
  const [downloadTrigger, setDownloadTrigger] = useState(0);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('designflow_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.screen) setScreen(parsed.screen);
        if (parsed.theme) setTheme(parsed.theme);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('designflow_state', JSON.stringify({ screen, theme }));
  }, [screen, theme]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setSelectedId(null);
    try {
      const data = await GeminiService.generateMobileUI(prompt, brandName, mood);
      // Preserve ID if overwriting to avoid jank? No, new ID is fine.
      setScreen({ ...data, id: `screen_${Date.now()}` });
    } catch (error) {
      alert("Failed to generate UI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const data = await GeminiService.analyzeScreenshot(base64);
        setScreen(data);
      } catch (error) {
        alert("Failed to analyze screenshot.");
      } finally {
        setIsGenerating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const updateComponent = (updated: UIComponent) => {
    setScreen(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === updated.id ? updated : c)
    }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === AppTheme.DARK ? AppTheme.LIGHT : AppTheme.DARK);
  };

  const selectedComponent = screen.components.find(c => c.id === selectedId) || null;

  return (
    <div className={`flex flex-col h-screen w-full bg-background text-white ${theme === AppTheme.LIGHT ? 'bg-gray-100 text-slate-900' : ''}`}>
      
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-surface shadow-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg tracking-tight hidden md:block">DesignFlow AI Studio</h1>
        </div>

        <div className="flex items-center gap-4">
           <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            {theme === AppTheme.DARK ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => setDownloadTrigger(t => t + 1)}
            className="flex items-center gap-2 bg-secondary/20 text-secondary hover:bg-secondary/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Control Panel */}
        <div className="w-80 border-r border-white/10 bg-surface flex flex-col z-20 overflow-y-auto hidden md:flex">
           <div className="p-6 space-y-6">
             
             {/* Prompt Section */}
             <div className="space-y-3">
               <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Describe your App</label>
               <textarea 
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
                 placeholder="e.g. A meditation app home screen with a dark calm theme, daily progress card, and list of sessions."
                 className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none resize-none h-32"
               />
               <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-lg flex justify-center items-center gap-2"
               >
                  {isGenerating ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Thinking...' : 'Generate UI'}
               </button>
             </div>

             {/* Brand Info */}
             <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Brand Name</label>
                    <input 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="ZenFlow"
                      className="w-full bg-black/20 border-b border-white/10 py-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                   <div>
                    <label className="text-xs font-semibold text-gray-500">Mood</label>
                    <input 
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="Calm"
                      className="w-full bg-black/20 border-b border-white/10 py-2 text-sm focus:border-primary outline-none"
                    />
                  </div>
                </div>
             </div>

             {/* Screenshot Upload */}
             <div className="space-y-3 pt-4 border-t border-white/5">
               <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Import Screenshot</label>
               <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-400">Upload to Remix</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
               </label>
             </div>

             {/* Component List (Quick Add) */}
             <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Add Component</label>
                <div className="grid grid-cols-2 gap-2">
                   {['Button', 'Card', 'Input', 'Header', 'Text', 'Image'].map(type => (
                      <button 
                        key={type}
                        onClick={() => {
                          const newComp: UIComponent = {
                            id: `new_${Date.now()}`,
                            type: type as any,
                            content: `New ${type}`,
                            style: { padding: '12px', margin: '4px 0' }
                          };
                          setScreen(prev => ({...prev, components: [...prev.components, newComp]}));
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded text-xs text-left flex items-center gap-2"
                      >
                         <Plus className="w-3 h-3" /> {type}
                      </button>
                   ))}
                </div>
             </div>

           </div>
        </div>

        {/* Center Canvas */}
        <main className="flex-1 relative bg-neutral-900/90 overflow-hidden">
           <MobileCanvas 
              screen={screen} 
              theme={theme}
              onSelectComponent={setSelectedId}
              selectedId={selectedId}
              downloadTrigger={downloadTrigger}
              onImageEdit={() => {}} // Handled inside editor panel logic mostly
           />
           
           {/* Mobile Fab for Controls (Visible only on small screens) */}
           <div className="md:hidden absolute bottom-6 right-6 flex flex-col gap-4">
              <button 
                onClick={() => {
                  const p = prompt('Enter UI Prompt:');
                  if(p) { setPrompt(p); handleGenerate(); }
                }}
                className="w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center"
              >
                <Sparkles className="w-6 h-6" />
              </button>
           </div>
        </main>

        {/* Right Editor Panel (Slide in) */}
        <EditorPanel 
           component={selectedComponent}
           onUpdate={updateComponent}
           isOpen={!!selectedComponent}
           onClose={() => setSelectedId(null)}
        />
        
      </div>
    </div>
  );
}
