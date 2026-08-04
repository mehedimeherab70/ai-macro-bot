// ============================================================
// AI Macro Bot — Core Type Definitions
// ============================================================

export type TriggerType =
  | 'time_schedule' | 'app_launched' | 'app_closed'
  | 'notification_received' | 'battery_level' | 'wifi_connected'
  | 'bluetooth_connected' | 'screen_on' | 'screen_off'
  | 'volume_button' | 'shake_device' | 'location_enter'
  | 'location_exit' | 'incoming_call' | 'sms_received'
  | 'webhook' | 'manual';

export type ActionType =
  | 'click_ui' | 'long_press' | 'swipe' | 'type_text'
  | 'launch_app' | 'go_home' | 'go_back' | 'open_notification'
  | 'toggle_wifi' | 'toggle_bluetooth' | 'toggle_flashlight'
  | 'set_brightness' | 'set_volume' | 'send_sms' | 'make_call'
  | 'http_request' | 'clipboard_copy' | 'clipboard_paste'
  | 'wait' | 'play_sound' | 'vibrate' | 'take_screenshot'
  | 'run_ai_action' | 'speak_text' | 'scroll';

export type ConstraintType =
  | 'time_range' | 'day_of_week' | 'battery_above' | 'battery_below'
  | 'wifi_state' | 'bluetooth_state' | 'screen_state'
  | 'app_foreground' | 'location_in' | 'notification_present';

export interface TimeScheduleTrigger { type: 'time_schedule'; cron: string; runAt?: string; }
export interface AppLaunchedTrigger { type: 'app_launched'; packageName: string | string[]; }
export interface AppClosedTrigger { type: 'app_closed'; packageName: string | string[]; }
export interface NotificationTrigger { type: 'notification_received'; packageName?: string; containsText?: string; regex?: string; }
export interface BatteryTrigger { type: 'battery_level'; level: number; direction: 'above' | 'below' | 'equals'; }
export interface WifiTrigger { type: 'wifi_connected'; ssid?: string; state: 'connected' | 'disconnected'; }
export interface WebhookTrigger { type: 'webhook'; url: string; method: 'GET' | 'POST'; }
export interface ManualTrigger { type: 'manual'; shortcutName?: string; }
export interface ShakeTrigger { type: 'shake_device'; sensitivity: 'low' | 'medium' | 'high'; }
export interface LocationTrigger { type: 'location_enter' | 'location_exit'; latitude: number; longitude: number; radiusMeters: number; }
export interface ScreenTrigger { type: 'screen_on' | 'screen_off'; }
export interface VolumeButtonTrigger { type: 'volume_button'; presses: number; windowMs: number; }
export interface BluetoothTrigger { type: 'bluetooth_connected'; deviceName?: string; state: 'connected' | 'disconnected'; }
export interface CallTrigger { type: 'incoming_call'; fromNumber?: string; }
export interface SmsTrigger { type: 'sms_received'; fromNumber?: string; containsText?: string; }

export type TriggerConfig = TimeScheduleTrigger | AppLaunchedTrigger | AppClosedTrigger | NotificationTrigger | BatteryTrigger | WifiTrigger | WebhookTrigger | ManualTrigger | ShakeTrigger | LocationTrigger | ScreenTrigger | VolumeButtonTrigger | BluetoothTrigger | CallTrigger | SmsTrigger;

export interface ClickUIAction { type: 'click_ui'; targetText?: string; contentDescription?: string; resourceId?: string; xFraction?: number; yFraction?: number; humanizeJitter?: number; }
export interface LongPressAction { type: 'long_press'; targetText?: string; contentDescription?: string; resourceId?: string; xFraction?: number; yFraction?: number; durationMs?: number; humanizeJitter?: number; }
export interface SwipeAction { type: 'swipe'; fromXFraction: number; fromYFraction: number; toXFraction: number; toYFraction: number; durationMs?: number; }
export interface TypeTextAction { type: 'type_text'; text: string; clearFirst?: boolean; humanizeTyping?: boolean; charDelayMs?: number; }
export interface LaunchAppAction { type: 'launch_app'; packageName: string; dataUri?: string; }
export interface WaitAction { type: 'wait'; durationMs: number; varianceMs?: number; }
export interface HttpRequestAction { type: 'http_request'; url: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE'; headers?: Record<string, string>; body?: string; saveResponseAs?: string; }
export interface SetVolumeAction { type: 'set_volume'; stream: 'media' | 'ring' | 'notification' | 'alarm'; level: number; }
export interface ToggleAction { type: 'toggle_wifi' | 'toggle_bluetooth' | 'toggle_flashlight' | 'go_home' | 'go_back' | 'open_notification'; }
export interface SetBrightnessAction { type: 'set_brightness'; level: number; }
export interface SendSmsAction { type: 'send_sms'; phoneNumber: string; message: string; }
export interface MakeCallAction { type: 'make_call'; phoneNumber: string; }
export interface ClipboardAction { type: 'clipboard_copy' | 'clipboard_paste'; text?: string; }
export interface VibrateAction { type: 'vibrate'; patternMs: number[]; repeat?: boolean; }
export interface PlaySoundAction { type: 'play_sound'; soundUri: string; volume?: number; }
export interface TakeScreenshotAction { type: 'take_screenshot'; savePath?: string; }
export interface RunAIAction { type: 'run_ai_action'; prompt: string; model?: string; maxSteps?: number; saveResultAs?: string; }
export interface SpeakTextAction { type: 'speak_text'; text: string; language?: string; }
export interface ScrollAction { type: 'scroll'; direction: 'up' | 'down' | 'left' | 'right'; amount?: number; }

export type ActionConfig = ClickUIAction | LongPressAction | SwipeAction | TypeTextAction | LaunchAppAction | WaitAction | HttpRequestAction | SetVolumeAction | ToggleAction | SetBrightnessAction | SendSmsAction | MakeCallAction | ClipboardAction | VibrateAction | PlaySoundAction | TakeScreenshotAction | RunAIAction | SpeakTextAction | ScrollAction;

export interface TimeRangeConstraint { type: 'time_range'; startTime: string; endTime: string; }
export interface DayOfWeekConstraint { type: 'day_of_week'; days: number[]; }
export interface BatteryConstraint { type: 'battery_above' | 'battery_below'; level: number; }
export interface ConnectionConstraint { type: 'wifi_state' | 'bluetooth_state'; state: 'on' | 'off' | 'connected'; }
export interface ScreenStateConstraint { type: 'screen_state'; state: 'on' | 'off'; }
export interface AppForegroundConstraint { type: 'app_foreground'; packageName: string; inForeground: boolean; }
export interface LocationConstraint { type: 'location_in'; latitude: number; longitude: number; radiusMeters: number; }
export type ConstraintConfig = TimeRangeConstraint | DayOfWeekConstraint | BatteryConstraint | ConnectionConstraint | ScreenStateConstraint | AppForegroundConstraint | LocationConstraint;

export interface MacroStep { id: string; action: ActionConfig; delayMs?: number; continueOnError?: boolean; }

export interface Macro { id: string; name: string; description?: string; icon?: string; color?: string; enabled: boolean; trigger: TriggerConfig; constraints: ConstraintConfig[]; steps: MacroStep[]; aiGenerated?: boolean; category?: string; runCount: number; lastRunAt?: string; createdAt: string; updatedAt: string; cooldownMs?: number; maxRunsPerDay?: number; variables: Record<string, string>; }

export interface AISuggestion { macro: Partial<Macro>; reasoning: string; confidence: number; }

export interface AIConfig { provider: 'openai' | 'anthropic' | 'gemini' | 'custom'; apiKey: string; baseUrl?: string; model: string; vision?: boolean; }

export interface AppState { macros: Macro[]; aiConfig: AIConfig; accessibilityEnabled: boolean; globalVariables: Record<string, string>; executionLog: ExecutionLogEntry[]; humanizationLevel: 'none' | 'low' | 'medium' | 'high'; darkMode: boolean; }

export interface ExecutionLogEntry { id: string; macroId: string; macroName: string; status: 'success' | 'failed' | 'cancelled' | 'running'; startedAt: string; completedAt?: string; stepResults: StepResult[]; errorMessage?: string; }
export interface StepResult { stepId: string; actionType: string; status: 'success' | 'failed' | 'skipped'; durationMs: number; output?: string; error?: string; }
