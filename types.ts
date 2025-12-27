export enum AppTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AMOLED = 'amoled'
}

export type ComponentType = 'Button' | 'Card' | 'Input' | 'Header' | 'Text' | 'Image' | 'Navbar' | 'List';

export interface UIStyle {
  backgroundColor?: string;
  textColor?: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
  margin?: string;
  shadow?: string;
  fontSize?: string;
  fontWeight?: string;
  width?: string;
  height?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  border?: string;
  flexDirection?: string;
  gap?: string;
  textAlign?: string;
  lineHeight?: string;
  objectFit?: string;
}

export interface UIComponent {
  id: string;
  type: ComponentType;
  content?: string;
  src?: string; // For images
  props?: Record<string, any>;
  style: UIStyle;
  children?: UIComponent[];
}

export interface ScreenData {
  id: string;
  name: string;
  backgroundColor: string;
  components: UIComponent[];
}

export interface ProjectState {
  currentPrompt: string;
  brandName: string;
  brandMood: string;
  theme: AppTheme;
  screens: ScreenData[];
  activeScreenId: string;
  selectedComponentId: string | null;
  history: string[]; // Prompt history
}

export interface GenerateUIRequest {
  prompt: string;
  brandName?: string;
  brandMood?: string;
  currentScreen?: ScreenData; // Context for updates
}