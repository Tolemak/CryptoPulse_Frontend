import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type Element<Props> = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & Props;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tolemak-bar': Element<{ app: string; home?: string; langs?: string; 'theme-key'?: string; static?: boolean }>;
      'tolemak-field': Element<{ label: string; tone?: 'accent' | 'warn' | 'error' }>;
    }
  }
}
