import { act, cleanup, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeContext';
import { useTheme } from './useTheme';

const wrapper = ({ children }: { children: React.ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(cleanup);

describe('ThemeProvider', () => {
  it('falls back to light when nothing is stored and the OS has no preference', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');
    vi.unstubAllGlobals();
  });

  it('follows a stored choice over the OS preference', () => {
    localStorage.setItem('theme', 'dark');
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    vi.unstubAllGlobals();
  });

  it('picks up a dark OS preference when nothing is stored', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('dark');
    vi.unstubAllGlobals();
  });

  it('persists the toggled theme and reflects it on the document', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    const initial = result.current.theme;

    act(() => result.current.toggleTheme());

    const toggled = initial === 'dark' ? 'light' : 'dark';
    expect(result.current.theme).toBe(toggled);
    expect(localStorage.getItem('theme')).toBe(toggled);
    expect(document.documentElement.getAttribute('data-theme')).toBe(toggled);
  });

  it('renders its children', () => {
    const { getByText } = render(<ThemeProvider><span>inside</span></ThemeProvider>);

    expect(getByText('inside')).toBeDefined();
  });
});

describe('useTheme', () => {
  it('refuses to work outside a provider', () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });
});
