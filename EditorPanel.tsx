import React, { useState } from 'react';
import { UIComponent } from '../types';
import { GeminiService } from '../services/gemini';
import { Wand2, Loader2, Type, Palette, BoxSelect } from 'lucide-react';

interface EditorPanelProps {
  component: UIComponent | null;
  onUpdate: (updated: UIComponent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ component, onUpdate, isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !component) return null;

  const handleStyleChange = (key: string, value: string) => {
    onUpdate({
      ...component,
      style: {
        ...component.style,
        [key]: value
      }
    });
  };

  const handleContentChange = (value: string) => {
    onUpdate({ ...component, content: value });
  };

  const handleAIImageEdit = async () => {
    if (component.type !== 'Image' || !component.src) return;
    
    setIsGenerating(true);
    try {
      // Fetch the image as blob/base64 to send to API
      // Note: In a real environment we need to handle CORS. 
      // We assume here the src is either a dataURI or a proxyable URL.
      // For this demo, we'll assume comp.src is accessible or base64.
      
      let base64 = component.src;
      if (base64.startsWith('http')) {
         // Quick hack to get base64 from URL if possible, otherwise fail gracefully
         try {
            const resp = await fetch(base64);
            const blob = await resp.blob();
            base64 = await new Promise((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result as string);
               reader.readAsDataURL(blob);
            }) as string;
            // Remove prefix
            base64 = base64.split(',')[1];
         } catch(e) {
            console.warn("Could not fetch image for editing, using placeholder logic or failing.");
            // If we can't fetch, we can't edit. 
            setIsGenerating(false);
            return;
         }
      } else {
         base64 = base64.split(',')[1];
      }

      const newImageBase64 = await GeminiService.editImage(base64, prompt);
      onUpdate({
        ...component,
        src: `data:image/png;base64,${newImageBase64}`
      });
      setPrompt('');
    } catch (error) {
      console.error("Failed to edit image", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-surface border-l border-white/10 shadow-2xl p-6 overflow-y-auto transform transition-transform duration-300 z-40 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BoxSelect className="w-5 h-5 text-secondary" />
          Edit {component.type}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
      </div>

      <div className="space-y-6">
        {/* Content */}
        {component.type !== 'Image' && (
          <div className="space-y-2">
             <label className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-2">
               <Type className="w-3 h-3" /> Content
             </label>
             <textarea 
               value={component.content || ''}
               onChange={(e) => handleContentChange(e.target.value)}
               className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm focus:border-primary outline-none"
               rows={3}
             />
          </div>
        )}

        {/* AI Image Editor */}
        {component.type === 'Image' && (
          <div className="space-y-3 bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
            <label className="text-xs font-semibold uppercase text-indigo-300 flex items-center gap-2">
              <Wand2 className="w-3 h-3" /> AI Image Editor
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Add a retro filter, make it sunset..."
              className="w-full bg-black/30 border border-indigo-500/30 rounded p-2 text-sm focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleAIImageEdit}
              disabled={isGenerating || !prompt}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded text-sm font-medium flex justify-center items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Edit'}
            </button>
          </div>
        )}

        {/* Styles */}
        <div className="space-y-4">
           <label className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-2">
              <Palette className="w-3 h-3" /> Styles
           </label>
           
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-gray-500">Color</label>
                <input 
                  type="color" 
                  value={component.style.color || '#ffffff'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Background</label>
                <input 
                  type="color" 
                  value={component.style.backgroundColor || 'transparent'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
           </div>

           <div>
              <label className="text-[10px] text-gray-500">Padding</label>
              <input 
                 type="text" 
                 value={component.style.padding || ''} 
                 onChange={(e) => handleStyleChange('padding', e.target.value)}
                 className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm"
                 placeholder="e.g. 16px"
              />
           </div>
           
           <div>
              <label className="text-[10px] text-gray-500">Border Radius</label>
              <input 
                 type="text" 
                 value={component.style.borderRadius || ''} 
                 onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                 className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm"
                 placeholder="e.g. 8px"
              />
           </div>

           <div>
              <label className="text-[10px] text-gray-500">Font Size</label>
              <input 
                 type="text" 
                 value={component.style.fontSize || ''} 
                 onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                 className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm"
                 placeholder="e.g. 14px"
              />
           </div>
        </div>
      </div>
    </div>
  );
};
