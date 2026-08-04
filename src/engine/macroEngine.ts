// AI Macro Bot — Macro Engine (Trigger → Constraint → Execute)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Macro, MacroStep, StepResult, ExecutionLogEntry, ActionConfig } from '../types';

const MACROS_KEY = '@aimacrobot_macros';
const LOGS_KEY = '@aimacrobot_logs';
const GLOBAL_VARS_KEY = '@aimacrobot_globals';

export async function loadMacros(): Promise<Macro[]> {
  const raw = await AsyncStorage.getItem(MACROS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveMacros(macros: Macro[]): Promise<void> {
  await AsyncStorage.setItem(MACROS_KEY, JSON.stringify(macros));
}

export async function addMacro(macro: Macro): Promise<void> {
  const macros = await loadMacros();
  macros.push(macro);
  await saveMacros(macros);
}

export async function updateMacro(updated: Macro): Promise<void> {
  const macros = await loadMacros();
  const idx = macros.findIndex((m) => m.id === updated.id);
  if (idx !== -1) { macros[idx] = { ...updated, updatedAt: new Date().toISOString() }; await saveMacros(macros); }
}

export async function deleteMacro(id: string): Promise<void> {
  const macros = await loadMacros();
  await saveMacros(macros.filter((m) => m.id !== id));
}

export async function toggleMacro(id: string): Promise<void> {
  const macros = await loadMacros();
  const m = macros.find((m) => m.id === id);
  if (m) { m.enabled = !m.enabled; await saveMacros(macros); }
}

export async function duplicateMacro(id: string): Promise<Macro | null> {
  const macros = await loadMacros();
  const orig = macros.find((m) => m.id === id);
  if (!orig) return null;
  const copy: Macro = { ...JSON.parse(JSON.stringify(orig)), id: `macro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: `${orig.name} (Copy)`, enabled: false, runCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  macros.push(copy);
  await saveMacros(macros);
  return copy;
}

export async function loadLogs(): Promise<ExecutionLogEntry[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addLog(entry: ExecutionLogEntry): Promise<void> {
  const logs = await loadLogs();
  logs.unshift(entry);
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
}

export async function clearLogs(): Promise<void> {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify([]));
}

export async function getGlobalVariables(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(GLOBAL_VARS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function setGlobalVariable(key: string, value: string): Promise<void> {
  const vars = await getGlobalVariables();
  vars[key] = value;
  await AsyncStorage.setItem(GLOBAL_VARS_KEY, JSON.stringify(vars));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeStep(step: MacroStep, globalVars: Record<string, string>): Promise<StepResult> {
  const startTime = Date.now();
  const stepResult: StepResult = { stepId: step.id, actionType: step.action.type, status: 'success', durationMs: 0, output: '' };
  try {
    if (step.delayMs && step.delayMs > 0) { await sleep(step.delayMs); }
    await executeAction(step.action, globalVars);
    stepResult.durationMs = Date.now() - startTime;
    stepResult.status = 'success';
  } catch (err: any) {
    stepResult.durationMs = Date.now() - startTime;
    stepResult.status = step.continueOnError ? 'skipped' : 'failed';
    stepResult.error = err?.message ?? 'Unknown error';
  }
  return stepResult;
}

async function executeAction(action: ActionConfig, vars: Record<string, string>): Promise<void> {
  const resolvedAction = resolveVariables(action, vars);
  switch (resolvedAction.type) {
    case 'wait': { const variance = (resolvedAction.varianceMs ?? 0) * (Math.random() * 2 - 1); await sleep(resolvedAction.durationMs + variance); break; }
    case 'run_ai_action': { console.log(`🤖 AI Action: ${resolvedAction.prompt}`); break; }
    case 'click_ui': case 'long_press': case 'swipe': case 'type_text': case 'scroll': { console.log(`📱 UI Action: ${resolvedAction.type}`, resolvedAction); break; }
    case 'launch_app': { console.log(`🚀 Launch: ${resolvedAction.packageName}`); break; }
    case 'http_request': {
      const resp = await fetch(resolvedAction.url, { method: resolvedAction.method, headers: resolvedAction.headers, body: resolvedAction.body ?? undefined });
      if (resolvedAction.saveResponseAs) { await setGlobalVariable(resolvedAction.saveResponseAs, await resp.text()); }
      break;
    }
    default: console.log(`⚡ Action: ${resolvedAction.type}`); break;
  }
}

function resolveVariables(action: ActionConfig, vars: Record<string, string>): ActionConfig {
  const resolved = JSON.parse(JSON.stringify(action));
  const replaceIn = (obj: any) => {
    if (typeof obj === 'string') { return obj.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`); }
    if (typeof obj === 'object' && obj !== null) { for (const k of Object.keys(obj)) { obj[k] = replaceIn(obj[k]); } }
    return obj;
  };
  return replaceIn(resolved);
}

let runningMacros = new Set<string>();

export async function runMacro(macro: Macro): Promise<ExecutionLogEntry> {
  if (runningMacros.has(macro.id)) { return { id: generateId(), macroId: macro.id, macroName: macro.name, status: 'cancelled', startedAt: new Date().toISOString(), stepResults: [], errorMessage: 'Macro already running' }; }
  runningMacros.add(macro.id);
  const entry: ExecutionLogEntry = { id: generateId(), macroId: macro.id, macroName: macro.name, status: 'running', startedAt: new Date().toISOString(), stepResults: [] };
  try {
    const vars = await getGlobalVariables();
    for (const step of macro.steps) { const result = await executeStep(step, vars); entry.stepResults.push(result); if (result.status === 'failed' && !step.continueOnError) { entry.status = 'failed'; entry.errorMessage = result.error; break; } }
    if (entry.status === 'running') { entry.status = 'success'; }
    macro.runCount++; macro.lastRunAt = new Date().toISOString(); await updateMacro(macro);
  } catch (err: any) { entry.status = 'failed'; entry.errorMessage = err?.message ?? 'Unexpected error'; }
  finally { entry.completedAt = new Date().toISOString(); runningMacros.delete(macro.id); await addLog(entry); }
  return entry;
}

export function evaluateTrigger(macro: Macro, event: { type: string; payload?: any }): boolean {
  const trigger = macro.trigger;
  switch (event.type) {
    case 'manual': return trigger.type === 'manual';
    case 'app_launched': if (trigger.type !== 'app_launched') return false; return trigger.packageName === event.payload?.packageName || (Array.isArray(trigger.packageName) && trigger.packageName.includes(event.payload?.packageName));
    case 'app_closed': if (trigger.type !== 'app_closed') return false; return trigger.packageName === event.payload?.packageName || (Array.isArray(trigger.packageName) && trigger.packageName.includes(event.payload?.packageName));
    case 'notification': if (trigger.type !== 'notification_received') return false; if (trigger.packageName && trigger.packageName !== event.payload?.packageName) return false; if (trigger.containsText && !event.payload?.text?.includes(trigger.containsText)) return false; return true;
    case 'screen_on': return trigger.type === 'screen_on';
    case 'screen_off': return trigger.type === 'screen_off';
    case 'battery': if (trigger.type !== 'battery_level') return false; const level = event.payload?.level ?? 0; if (trigger.direction === 'above') return level >= trigger.level; if (trigger.direction === 'below') return level <= trigger.level; return level === trigger.level;
    case 'shake': return trigger.type === 'shake_device';
    case 'wifi': if (trigger.type !== 'wifi_connected') return false; return event.payload?.state === trigger.state;
    default: return false;
  }
}

export function evaluateConstraints(macro: Macro, context: Record<string, any>): boolean {
  for (const c of macro.constraints) {
    switch (c.type) {
      case 'time_range': { const now = new Date(); const cm = now.getHours() * 60 + now.getMinutes(); const [sh, sm] = c.startTime.split(':').map(Number); const [eh, em] = c.endTime.split(':').map(Number); const smin = sh * 60 + sm; const emin = eh * 60 + em; if (smin <= emin) { if (cm < smin || cm > emin) return false; } else { if (cm < smin && cm > emin) return false; } break; }
      case 'day_of_week': if (!c.days.includes(new Date().getDay())) return false; break;
      case 'battery_above': if ((context.batteryLevel ?? 100) < c.level) return false; break;
      case 'battery_below': if ((context.batteryLevel ?? 0) > c.level) return false; break;
      case 'wifi_state': if (context.wifiState !== c.state) return false; break;
      default: break;
    }
  }
  return true;
}