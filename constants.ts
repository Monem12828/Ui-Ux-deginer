import { ScreenData, AppTheme } from "./types";

export const INITIAL_SCREEN: ScreenData = {
  id: 'initial_screen',
  name: 'Start',
  backgroundColor: '#0f172a',
  components: [
    {
      id: 'h1',
      type: 'Header',
      content: 'Welcome to DesignFlow',
      style: { color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: '20px 0', textAlign: 'center' }
    },
    {
      id: 'p1',
      type: 'Text',
      content: 'Enter a prompt to generate your mobile UI instantly.',
      style: { color: '#94a3b8', fontSize: '16px', margin: '0 20px 20px 20px', textAlign: 'center', lineHeight: '1.5' }
    },
    {
      id: 'img1',
      type: 'Image',
      src: 'https://picsum.photos/400/300',
      style: { width: '100%', height: '200px', borderRadius: '16px', margin: '0 0 20px 0', objectFit: 'cover' }
    },
    {
      id: 'btn1',
      type: 'Button',
      content: 'Get Started',
      style: { backgroundColor: '#6366f1', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: '600' }
    }
  ]
};

export const THEME_STYLES = {
  [AppTheme.LIGHT]: { bg: '#ffffff', surface: '#f1f5f9', text: '#0f172a' },
  [AppTheme.DARK]: { bg: '#0f172a', surface: '#1e293b', text: '#f8fafc' },
  [AppTheme.AMOLED]: { bg: '#000000', surface: '#121212', text: '#ffffff' }
};
