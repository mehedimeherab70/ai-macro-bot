// AI Macro Bot — Native Module Bridge (React Native ↔ Android)
import { NativeModules, Platform } from 'react-native';

interface MacroNativeModule {
  isAccessibilityEnabled(): Promise<boolean>;
  openAccessibilitySettings(): void;
  clickByText(text: string): Promise<boolean>;
  clickByContentDescription(desc: string): Promise<boolean>;
  clickByResourceId(id: string): Promise<boolean>;
  clickByCoordinates(xFraction: number, yFraction: number, jitterPx?: number): Promise<boolean>;
  longPressByText(text: string, durationMs?: number): Promise<boolean>;
  longPressByCoordinates(xFraction: number, yFraction: number, durationMs?: number): Promise<boolean>;
  swipe(fromX: number, fromY: number, toX: number, toY: number, durationMs?: number): Promise<boolean>;
  scroll(direction: 'up' | 'down' | 'left' | 'right', amount?: number): Promise<boolean>;
  typeText(text: string, humanize?: boolean, charDelayMs?: number): Promise<boolean>;
  launchApp(packageName: string, dataUri?: string): Promise<boolean>;
  goHome(): Promise<boolean>;
  goBack(): Promise<boolean>;
  openNotifications(): Promise<boolean>;
  takeScreenshot(savePath?: string): Promise<string>;
  toggleWiFi(enabled: boolean): Promise<boolean>;
  toggleBluetooth(enabled: boolean): Promise<boolean>;
  toggleFlashlight(enabled: boolean): Promise<boolean>;
  setBrightness(level: number): Promise<boolean>;
  setVolume(stream: string, level: number): Promise<boolean>;
  vibrate(patternMs: number[], repeat?: boolean): Promise<boolean>;
  speakText(text: string, language?: string): Promise<boolean>;
  getForegroundApp(): Promise<string>;
  getInstalledApps(): Promise<string[]>;
  addEventListener(event: string, callback: (data: any) => void): void;
  removeEventListener(event: string): void;
}

class NativeBridge implements MacroNativeModule {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  async isAccessibilityEnabled(): Promise<boolean> {
    if (Platform.OS === 'android') { try { const m = NativeModules.MacroAccessibilityModule; if (m) return await m.isAccessibilityEnabled(); } catch {} }
    return false;
  }

  openAccessibilitySettings(): void {
    if (Platform.OS === 'android') { try { const m = NativeModules.MacroAccessibilityModule; if (m) m.openAccessibilitySettings(); } catch (e) { console.warn('Cannot open accessibility settings:', e); } }
  }

  async clickByText(text: string): Promise<boolean> { return this.callNative('clickByText', { text }); }
  async clickByContentDescription(desc: string): Promise<boolean> { return this.callNative('clickByContentDescription', { desc }); }
  async clickByResourceId(id: string): Promise<boolean> { return this.callNative('clickByResourceId', { id }); }
  async clickByCoordinates(xFraction: number, yFraction: number, jitterPx?: number): Promise<boolean> { return this.callNative('clickByCoordinates', { xFraction, yFraction, jitterPx }); }
  async longPressByText(text: string, durationMs?: number): Promise<boolean> { return this.callNative('longPressByText', { text, durationMs }); }
  async longPressByCoordinates(xFraction: number, yFraction: number, durationMs?: number): Promise<boolean> { return this.callNative('longPressByCoordinates', { xFraction, yFraction, durationMs }); }
  async swipe(fromX: number, fromY: number, toX: number, toY: number, durationMs = 300): Promise<boolean> { return this.callNative('swipe', { fromX, fromY, toX, toY, durationMs }); }
  async scroll(direction: 'up' | 'down' | 'left' | 'right', amount?: number): Promise<boolean> { return this.callNative('scroll', { direction, amount }); }
  async typeText(text: string, humanize = false, charDelayMs = 100): Promise<boolean> { return this.callNative('typeText', { text, humanize, charDelayMs }); }
  async launchApp(packageName: string, dataUri?: string): Promise<boolean> { return this.callNative('launchApp', { packageName, dataUri }); }
  async goHome(): Promise<boolean> { return this.callNative('goHome', {}); }
  async goBack(): Promise<boolean> { return this.callNative('goBack', {}); }
  async openNotifications(): Promise<boolean> { return this.callNative('openNotifications', {}); }
  async takeScreenshot(savePath?: string): Promise<string> { return this.callNative('takeScreenshot', { savePath }); }
  async toggleWiFi(enabled: boolean): Promise<boolean> { return this.callNative('toggleWiFi', { enabled }); }
  async toggleBluetooth(enabled: boolean): Promise<boolean> { return this.callNative('toggleBluetooth', { enabled }); }
  async toggleFlashlight(enabled: boolean): Promise<boolean> { return this.callNative('toggleFlashlight', { enabled }); }
  async setBrightness(level: number): Promise<boolean> { return this.callNative('setBrightness', { level }); }
  async setVolume(stream: string, level: number): Promise<boolean> { return this.callNative('setVolume', { stream, level }); }
  async vibrate(patternMs: number[], repeat = false): Promise<boolean> { return this.callNative('vibrate', { patternMs, repeat }); }
  async speakText(text: string, language?: string): Promise<boolean> { return this.callNative('speakText', { text, language }); }
  async getForegroundApp(): Promise<string> { return this.callNative('getForegroundApp', {}); }
  async getInstalledApps(): Promise<string[]> { return this.callNative('getInstalledApps', {}); }

  addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
  }

  removeEventListener(event: string): void { this.listeners.delete(event); }

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) callbacks.forEach((cb) => cb(data));
  }

  private async callNative(method: string, params: Record<string, any>): Promise<any> {
    if (Platform.OS === 'android') { try { const m = NativeModules.MacroAccessibilityModule; if (m && typeof m[method] === 'function') return await m[method](params); } catch (e) { console.warn(`Native call failed: ${method}`, e); } }
    return true;
  }
}

export const nativeBridge = new NativeBridge();
export default nativeBridge;
