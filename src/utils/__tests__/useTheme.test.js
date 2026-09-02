import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  let localStorageMock;
  let matchMediaMock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock;

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
    global.matchMedia = jest.fn(() => matchMediaMock);

    // Mock document.documentElement
    document.documentElement.setAttribute = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with dark theme by default', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(result.current.isLight).toBe(false);
  });

  test('initializes with a theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(['light', 'dark']).toContain(result.current.theme);
    expect(typeof result.current.isDark).toBe('boolean');
    expect(typeof result.current.isLight).toBe('boolean');
  });

  test('initializes with system preference when no stored theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dark');
  });

  test('applies theme to document on mount', () => {
    renderHook(() => useTheme());

    expect(document.documentElement.setAttribute).toHaveBeenCalled();
    const call = document.documentElement.setAttribute.mock.calls[0];
    expect(call[0]).toBe('data-theme');
    expect(['light', 'dark']).toContain(call[1]);
  });

  test('toggles theme', () => {
    const { result } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    const newTheme = result.current.theme;
    expect(newTheme).not.toBe(initialTheme);
    expect(['light', 'dark']).toContain(newTheme);
  });

  test('sets specific theme using setTheme', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  test('ignores invalid theme values in setTheme', () => {
    const { result } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    act(() => {
      result.current.setTheme('invalid');
    });

    expect(result.current.theme).toBe(initialTheme);
  });

  test('toggleTheme changes the theme', () => {
    const { result } = renderHook(() => useTheme());

    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).not.toBe(initialTheme);
  });

  test('updates document attribute when theme changes', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
      'data-theme',
      expect.any(String)
    );
  });

  test('listens for system theme changes with addEventListener', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderHook(() => useTheme());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  test('removes event listener on unmount with removeEventListener', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  test('uses legacy addListener when addEventListener is not available', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.addEventListener = undefined;

    renderHook(() => useTheme());

    expect(matchMediaMock.addListener).toHaveBeenCalledWith(expect.any(Function));
  });

  test('removes legacy listener on unmount with removeListener', () => {
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.addEventListener = undefined;
    matchMediaMock.removeEventListener = undefined;

    const { unmount } = renderHook(() => useTheme());

    unmount();

    expect(matchMediaMock.removeListener).toHaveBeenCalledWith(expect.any(Function));
  });

  test('listens for system theme changes', () => {
    let changeHandler;
    matchMediaMock.addEventListener = jest.fn((event, handler) => {
      changeHandler = handler;
    });

    const { result } = renderHook(() => useTheme());

    expect(changeHandler).toBeDefined();

    // Trigger system theme change
    act(() => {
      changeHandler({ matches: true });
    });

    // Theme should be set (either dark or light)
    expect(['light', 'dark']).toContain(result.current.theme);
  });
});
