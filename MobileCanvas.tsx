import React, { useRef, useEffect } from 'react';
import { UIComponent, ScreenData, AppTheme } from '../types';
import { THEME_STYLES } from '../constants';
import * as htmlToImage from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';

interface MobileCanvasProps {
  screen: ScreenData;
  theme: AppTheme;
  onSelectComponent: (id: string) => void;
  selectedId: string | null;
  downloadTrigger: number; // Increment to trigger download
  onImageEdit: (id: string, base64: string) => void; // Callback for when an image is ready for editing context
}

export const MobileCanvas: React.FC<MobileCanvasProps> = ({ 
  screen, 
  theme, 
  onSelectComponent, 
  selectedId, 
  downloadTrigger 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Handle Download
  useEffect(() => {
    if (downloadTrigger > 0 && canvasRef.current) {
      htmlToImage.toPng(canvasRef.current, { cacheBust: true })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `designflow-${screen.name}-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('oops, something went wrong!', err);
        });
    }
  }, [downloadTrigger, screen.name]);

  const renderComponent = (comp: UIComponent) => {
    const isSelected = selectedId === comp.id;
    const baseStyle: React.CSSProperties = {
      ...comp.style,
      position: 'relative',
      outline: isSelected ? '2px solid #a855f7' : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelectComponent(comp.id);
    };

    switch (comp.type) {
      case 'Button':
        return (
          <div key={comp.id} style={baseStyle} onClick={handleClick} className="hover:opacity-90 active:scale-95 shadow-lg">
            {comp.content}
          </div>
        );
      case 'Image':
        return (
          <div key={comp.id} style={{...baseStyle, overflow: 'hidden'}} onClick={handleClick}>
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={comp.src || 'https://picsum.photos/400/200'} alt="Component" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            {isSelected && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Select to Edit AI</span>
              </div>
            )}
          </div>
        );
      case 'Input':
        return (
          <input 
            key={comp.id} 
            style={baseStyle} 
            placeholder={comp.content} 
            readOnly 
            onClick={handleClick}
            className="focus:outline-none"
          />
        );
      case 'Card':
        return (
          <div key={comp.id} style={baseStyle} onClick={handleClick} className="shadow-md">
            {comp.children ? comp.children.map(renderComponent) : (
               <div className="p-4">
                 <h3 className="font-bold mb-2">{comp.props?.title || 'Card Title'}</h3>
                 <p className="opacity-80 text-sm">{comp.content || 'Card content goes here...'}</p>
               </div>
            )}
          </div>
        );
      case 'Header':
        return <h1 key={comp.id} style={baseStyle} onClick={handleClick}>{comp.content}</h1>;
      case 'Text':
        return <p key={comp.id} style={baseStyle} onClick={handleClick}>{comp.content}</p>;
      case 'Navbar':
         return (
           <div key={comp.id} style={baseStyle} onClick={handleClick} className="flex justify-between items-center px-4 shadow-sm">
             <div className="font-bold text-lg">{comp.props?.title || 'App'}</div>
             <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-current opacity-20"></div>
                <div className="w-6 h-6 rounded-full bg-current opacity-20"></div>
             </div>
           </div>
         );
      default:
        return <div key={comp.id} style={baseStyle} onClick={handleClick}>{comp.content}</div>;
    }
  };

  const themeColors = THEME_STYLES[theme];

  return (
    <div className="flex justify-center items-center h-full w-full py-8 overflow-hidden bg-gray-900/50 backdrop-blur-sm">
      <div 
        className="relative w-[375px] h-[812px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-50 flex justify-center items-center gap-2">
            <div className="w-16 h-1 bg-gray-800 rounded-full"></div>
        </div>

        {/* Screen Content */}
        <div 
          ref={canvasRef}
          className="w-full h-full overflow-y-auto no-scrollbar pt-10 pb-8 px-4 flex flex-col gap-4"
          style={{ backgroundColor: screen.backgroundColor || themeColors.bg }}
          onClick={() => onSelectComponent('')}
        >
          {screen.components.map(renderComponent)}
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50"></div>
      </div>
    </div>
  );
};
