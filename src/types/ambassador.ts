export interface AmbassadorProfile {
  id: string;
  name: string;
  photoUrl: string;
  whatsapp: string;
  socials: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  themeColor?: string;
}

export type WidgetType = 'product-grid' | 'hero' | 'testimonials' | 'contact' | 'video' | 'text';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  props: Record<string, unknown>;
  grid: {
    col: number; // Start col
    row: number; // Start row
    width: number; // Col span
    height: number; // Row span
  };
}
