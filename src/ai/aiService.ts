// AI Macro Bot — AI Service (Suggestions, Generation, Vision)
import { Macro, AIConfig, AISuggestion, TriggerConfig, ActionConfig, ConstraintConfig } from '../types';

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; }

async function callAI(config: AIConfig, messages: ChatMessage[], jsonMode = false): Promise<string> {
  const baseUrl = config.baseUrl || getDefaultBaseUrl(config.provider);
  const apiPath = getApiPath(config.provider);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.provider === 'openai' || config.provider === 'custom') { headers['Authorization'] = `Bearer ${config.apiKey}`; }
  else if (config.provider === 'anthropic') { headers['x-api-key'] = config.apiKey; headers['anthropic-version'] = '2023-06-01'; }
  const response = await fetch(`${baseUrl}${apiPath}`, { method: 'POST', headers, body: JSON.stringify(buildRequestBody(config, messages, jsonMode)) });
  if (!response.ok) { const err = await response.text(); throw new Error(`AI API error (${response.status}): ${err}`); }
  const data = await response.json();
  return extractContent(config.provider, data);
}

function getDefaultBaseUrl(provider: AIConfig['provider']): string {
  switch (provider) { case 'openai': return 'https://api.openai.com'; case 'anthropic': return 'https://api.anthropic.com'; case 'gemini': return 'https://generativelanguage.googleapis.com'; default: return 'https://api.openai.com'; }
}

function getApiPath(provider: AIConfig['provider']): string {
  switch (provider) { case 'openai': case 'custom': return '/v1/chat/completions'; case 'anthropic': return '/v1/messages'; case 'gemini': return `/v1beta/models/gemini-pro:generateContent`; default: return '/v1/chat/completions'; }
}

function buildRequestBody(config: AIConfig, messages: ChatMessage[], jsonMode: boolean): any {
  if (config.provider === 'anthropic') { const sm = messages.find(m => m.role === 'system'); const um = messages.filter(m => m.role !== 'system'); return { model: config.model || 'claude-3-5-sonnet-20241022', max_tokens: 4096, system: sm?.content, messages: um.map(m => ({ role: m.role, content: m.content })) }; }
  if (config.provider === 'gemini') { const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })); return { contents }; }
  return { model: config.model || 'gpt-4o-mini', messages, max_tokens: 4096, temperature: 0.7, response_format: jsonMode ? { type: 'json_object' } : undefined };
}

function extractContent(provider: AIConfig['provider'], data: any): string {
  if (provider === 'anthropic') { return data?.content?.[0]?.text ?? ''; }
  if (provider === 'gemini') { return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''; }
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function generateMacro(config: AIConfig, userDescription: string): Promise<Macro | null> {
  const systemPrompt = `You are an expert Android automation engineer. Generate a complete MacroDroid-style macro in JSON format based on the user's description.
Return JSON: { "name": "...", "description": "...", "trigger": { "type": "...", ... }, "constraints": [...], "steps": [{ "id": "step_1", "action": { "type": "...", ... } }] }
Available triggers: time_schedule (cron), app_launched (packageName), notification_received, battery_level, wifi_connected, screen_on/off, manual, shake_device, bluetooth_connected
Available actions: click_ui, long_press, swipe, type_text, launch_app, wait, http_request, go_home, go_back, toggle_wifi, toggle_bluetooth, toggle_flashlight, set_brightness, set_volume, vibrate, speak_text, clipboard_copy, take_screenshot, scroll
Available constraints: time_range, day_of_week, battery_above/below, wifi_state, screen_state
Return ONLY valid JSON, no markdown.`;
  try {
    const response = await callAI(config, [{ role: 'system', content: systemPrompt }, { role: 'user', content: `Create a macro for: ${userDescription}` }], true);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const generated = JSON.parse(jsonMatch[0]);
    const now = new Date().toISOString();
    return { id: `macro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: generated.name || 'AI Generated Macro', description: generated.description || userDescription, enabled: false, trigger: generated.trigger || { type: 'manual' }, constraints: generated.constraints || [], steps: (generated.steps || []).map((s: any, i: number) => ({ id: s.id || `step_${i + 1}`, action: s.action, delayMs: s.delayMs || 500, continueOnError: false })), aiGenerated: true, category: 'AI Generated', runCount: 0, createdAt: now, updatedAt: now, variables: {} };
  } catch (err) { console.error('AI generation failed:', err); return null; }
}

export async function analyzeScreen(config: AIConfig, screenshotBase64: string, goal: string): Promise<{ elements: Array<{ text: string; type: string; bounds?: string }>; suggestedAction: string }> {
  try {
    const response = await callAI(config, [{ role: 'system', content: `Analyze Android screenshot for: ${goal}. Return JSON: { "elements": [{"text":"...","type":"button|text|input","bounds":"x,y,w,h"}], "suggestedAction": "..." }` }, { role: 'user', content: `What UI elements are relevant for: ${goal}?` }], true);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { elements: [], suggestedAction: '' };
    return JSON.parse(jsonMatch[0]);
  } catch { return { elements: [], suggestedAction: '' }; }
}

export async function nlToActions(config: AIConfig, instruction: string): Promise<ActionConfig[]> {
  try {
    const response = await callAI(config, [{ role: 'system', content: 'Convert this natural language instruction into a JSON array of Android automation actions. Only return JSON array.' }, { role: 'user', content: instruction }], true);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch { return []; }
}

export async function optimizeMacro(config: AIConfig, macro: Macro): Promise<{ suggestions: string[]; optimizedMacro?: Macro }> {
  try {
    const response = await callAI(config, [{ role: 'system', content: 'Review this macro and suggest improvements. Return JSON: { "suggestions": ["tip"], "optimizedMacro": {...} }' }, { role: 'user', content: JSON.stringify(macro, null, 2) }], true);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { suggestions: [] };
    return JSON.parse(jsonMatch[0]);
  } catch { return { suggestions: [] }; }
}

export async function getAISuggestions(config: AIConfig, installedApps: string[]): Promise<AISuggestion[]> {
  try {
    const response = await callAI(config, [{ role: 'system', content: 'Based on these apps, suggest useful automation macros. Return JSON array: [{ "macro": {...}, "reasoning": "...", "confidence": 0.8 }]' }, { role: 'user', content: `Installed apps: ${installedApps.join(', ')}` }], false);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch { return []; }
}