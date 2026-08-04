// AI Macro Bot — Macro Editor Screen
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Macro, TriggerConfig, ActionConfig, ConstraintConfig, MacroStep } from '../types';
import { loadMacros, updateMacro, addMacro } from '../engine/macroEngine';

const TRIGGER_TYPES: { label: string; value: TriggerConfig['type']; icon: string }[] = [
  { label: 'Manual', value: 'manual', icon: 'hand-left-outline' }, { label: 'Time Schedule', value: 'time_schedule', icon: 'time-outline' },
  { label: 'App Launched', value: 'app_launched', icon: 'apps-outline' }, { label: 'App Closed', value: 'app_closed', icon: 'close-circle-outline' },
  { label: 'Notification', value: 'notification_received', icon: 'notifications-outline' }, { label: 'Battery Level', value: 'battery_level', icon: 'battery-full-outline' },
  { label: 'WiFi Connected', value: 'wifi_connected', icon: 'wifi-outline' }, { label: 'Screen On', value: 'screen_on', icon: 'phone-portrait-outline' },
  { label: 'Screen Off', value: 'screen_off', icon: 'phone-portrait' }, { label: 'Shake Device', value: 'shake_device', icon: 'phone-landscape-outline' },
  { label: 'Bluetooth', value: 'bluetooth_connected', icon: 'bluetooth-outline' },
];

const ACTION_TYPES: { label: string; value: ActionConfig['type']; icon: string }[] = [
  { label: 'Click UI', value: 'click_ui', icon: 'finger-print-outline' }, { label: 'Long Press', value: 'long_press', icon: 'hand-left' },
  { label: 'Swipe', value: 'swipe', icon: 'swap-vertical-outline' }, { label: 'Type Text', value: 'type_text', icon: 'text-outline' },
  { label: 'Launch App', value: 'launch_app', icon: 'rocket-outline' }, { label: 'Wait', value: 'wait', icon: 'hourglass-outline' },
  { label: 'HTTP Request', value: 'http_request', icon: 'globe-outline' }, { label: 'Go Home', value: 'go_home', icon: 'home-outline' },
  { label: 'Go Back', value: 'go_back', icon: 'arrow-back-outline' }, { label: 'Toggle WiFi', value: 'toggle_wifi', icon: 'wifi-outline' },
  { label: 'Toggle BT', value: 'toggle_bluetooth', icon: 'bluetooth-outline' }, { label: 'Flashlight', value: 'toggle_flashlight', icon: 'flashlight-outline' },
  { label: 'Set Volume', value: 'set_volume', icon: 'volume-high-outline' }, { label: 'Set Brightness', value: 'set_brightness', icon: 'sunny-outline' },
  { label: 'Vibrate', value: 'vibrate', icon: 'pulse-outline' }, { label: 'Speak Text', value: 'speak_text', icon: 'mic-outline' },
  { label: 'Scroll', value: 'scroll', icon: 'arrow-down-outline' }, { label: 'Screenshot', value: 'take_screenshot', icon: 'camera-outline' },
  { label: 'Copy/Paste', value: 'clipboard_copy', icon: 'copy-outline' }, { label: 'AI Action', value: 'run_ai_action', icon: 'sparkles' },
];

export default function MacroEditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const macroId = route.params?.macroId;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<TriggerConfig>({ type: 'manual' });
  const [steps, setSteps] = useState<MacroStep[]>([]);
  const [constraints, setConstraints] = useState<ConstraintConfig[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [showTriggerPicker, setShowTriggerPicker] = useState(false);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [triggerDetails, setTriggerDetails] = useState('');
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);

  useEffect(() => { if (macroId) { (async () => { const macros = await loadMacros(); const m = macros.find((m) => m.id === macroId); if (m) { setEditingMacro(m); setName(m.name); setDescription(m.description || ''); setTrigger(m.trigger); setSteps(m.steps); setConstraints(m.constraints); setEnabled(m.enabled); if (m.trigger.type === 'time_schedule') setTriggerDetails((m.trigger as any).cron || ''); if (m.trigger.type === 'app_launched') setTriggerDetails((m.trigger as any).packageName || ''); } })(); } }, [macroId]);

  const addStep = (actionType: ActionConfig['type']) => {
    let action: ActionConfig;
    switch (actionType) {
      case 'wait': action = { type: 'wait', durationMs: 1000, varianceMs: 200 }; break;
      case 'click_ui': action = { type: 'click_ui', targetText: '', humanizeJitter: 5 }; break;
      case 'type_text': action = { type: 'type_text', text: '', humanizeTyping: true }; break;
      case 'swipe': action = { type: 'swipe', fromXFraction: 0.5, fromYFraction: 0.8, toXFraction: 0.5, toYFraction: 0.2 }; break;
      case 'launch_app': action = { type: 'launch_app', packageName: '' }; break;
      case 'run_ai_action': action = { type: 'run_ai_action', prompt: '', maxSteps: 5 }; break;
      case 'speak_text': action = { type: 'speak_text', text: '' }; break;
      case 'http_request': action = { type: 'http_request', url: '', method: 'GET' }; break;
      case 'set_volume': action = { type: 'set_volume', stream: 'media', level: 50 }; break;
      case 'set_brightness': action = { type: 'set_brightness', level: 50 }; break;
      case 'scroll': action = { type: 'scroll', direction: 'down', amount: 500 }; break;
      case 'vibrate': action = { type: 'vibrate', patternMs: [0, 200, 100, 200] }; break;
      default: action = { type: actionType } as ActionConfig;
    }
    setSteps([...steps, { id: `step_${Date.now()}`, action, delayMs: 500, continueOnError: false }]);
    setShowActionPicker(false);
  };

  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const moveStep = (i: number, d: 'up' | 'down') => {
    const ns = [...steps]; const t = d === 'up' ? i - 1 : i + 1;
    if (t < 0 || t >= ns.length) return; [ns[i], ns[t]] = [ns[t], ns[i]]; setSteps(ns);
  };

  const updateStepConfig = (i: number, updates: Partial<any>) => {
    const ns = [...steps]; ns[i] = { ...ns[i], action: { ...ns[i].action, ...updates } }; setSteps(ns);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Enter macro name.'); return; }
    const now = new Date().toISOString();
    const macroData: Macro = { id: editingMacro?.id || `macro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), description: description.trim(), icon: 'flash', color: '#8B5CF6', enabled, trigger, constraints, steps, aiGenerated: editingMacro?.aiGenerated || false, runCount: editingMacro?.runCount || 0, createdAt: editingMacro?.createdAt || now, updatedAt: now, variables: editingMacro?.variables || {} };
    if (editingMacro) await updateMacro(macroData); else await addMacro(macroData);
    Alert.alert('✅ Saved', `"${macroData.name}" saved.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  const renderActionConfig = (step: MacroStep, index: number) => {
    const a = step.action;
    return (
      <View key={step.id} style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
          <Text style={styles.stepType}>{a.type}</Text>
          <TouchableOpacity onPress={() => moveStep(index, 'up')}><Ionicons name="chevron-up" size={18} color="#9CA3AF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => moveStep(index, 'down')}><Ionicons name="chevron-down" size={18} color="#9CA3AF" /></TouchableOpacity>
          <TouchableOpacity onPress={() => removeStep(index)}><Ionicons name="close-circle" size={20} color="#EF4444" /></TouchableOpacity>
        </View>
        {a.type === 'wait' && <View style={styles.stepConfig}><Text style={styles.configLabel}>Duration (ms)</Text><TextInput style={styles.configInput} value={String(a.durationMs)} onChangeText={(v) => updateStepConfig(index, { durationMs: parseInt(v) || 1000 })} keyboardType="numeric" placeholder="1000" placeholderTextColor="#4B5563" /></View>}
        {(a.type === 'click_ui' || a.type === 'long_press') && <View style={styles.stepConfig}><Text style={styles.configLabel}>Target Text</Text><TextInput style={styles.configInput} value={(a as any).targetText || ''} onChangeText={(v) => updateStepConfig(index, { targetText: v })} placeholder="Button text" placeholderTextColor="#4B5563" /></View>}
        {a.type === 'type_text' && <View style={styles.stepConfig}><Text style={styles.configLabel}>Text to Type</Text><TextInput style={styles.configInput} value={a.text} onChangeText={(v) => updateStepConfig(index, { text: v })} placeholder="Enter text..." placeholderTextColor="#4B5563" multiline /><View style={styles.switchRow}><Text style={styles.configLabel}>Humanize Typing</Text><Switch value={a.humanizeTyping || false} onValueChange={(v) => updateStepConfig(index, { humanizeTyping: v })} trackColor={{ false: '#333', true: '#8B5CF6' }} /></View></View>}
        {a.type === 'launch_app' && <View style={styles.stepConfig}><Text style={styles.configLabel}>Package Name</Text><TextInput style={styles.configInput} value={a.packageName} onChangeText={(v) => updateStepConfig(index, { packageName: v })} placeholder="com.example.app" placeholderTextColor="#4B5563" /></View>}
        {a.type === 'run_ai_action' && <View style={styles.stepConfig}><Text style={styles.configLabel}>AI Prompt</Text><TextInput style={styles.configInput} value={a.prompt} onChangeText={(v) => updateStepConfig(index, { prompt: v })} placeholder="Describe what AI should do..." placeholderTextColor="#4B5563" multiline /></View>}
        {a.type === 'speak_text' && <View style={styles.stepConfig}><Text style={styles.configLabel}>Text to Speak</Text><TextInput style={styles.configInput} value={a.text} onChangeText={(v) => updateStepConfig(index, { text: v })} placeholder="Text to read aloud..." placeholderTextColor="#4B5563" /></View>}
        {a.type === 'http_request' && <View style={styles.stepConfig}><Text style={styles.configLabel}>URL</Text><TextInput style={styles.configInput} value={a.url} onChangeText={(v) => updateStepConfig(index, { url: v })} placeholder="https://..." placeholderTextColor="#4B5563" /></View>}
        {a.type === 'scroll' && <View style={styles.stepConfig}><Text style={styles.configLabel}>Direction</Text><View style={styles.rowBtns}>{['up','down','left','right'].map((d) => (<TouchableOpacity key={d} style={[styles.dirBtn, a.direction === d && styles.dirBtnActive]} onPress={() => updateStepConfig(index, { direction: d })}><Text style={[styles.dirBtnText, a.direction === d && styles.dirBtnTextActive]}>{d}</Text></TouchableOpacity>))}</View></View>}
        <View style={styles.stepConfig}><Text style={styles.configLabel}>Delay Before (ms)</Text><TextInput style={styles.configInput} value={String(step.delayMs || 0)} onChangeText={(v) => { const ns = [...steps]; ns[index] = { ...ns[index], delayMs: parseInt(v) || 0 }; setSteps(ns); }} keyboardType="numeric" placeholder="500" placeholderTextColor="#4B5563" /></View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{editingMacro ? 'Edit Macro' : 'New Macro'}</Text>
        <TouchableOpacity onPress={handleSave}><Ionicons name="checkmark" size={24} color="#10B981" /></TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Macro Name</Text>
        <TextInput style={styles.mainInput} value={name} onChangeText={setName} placeholder="Enter macro name..." placeholderTextColor="#4B5563" />
        <Text style={styles.sectionLabel}>Description</Text>
        <TextInput style={[styles.mainInput, { minHeight: 60 }]} value={description} onChangeText={setDescription} placeholder="What does this macro do?" placeholderTextColor="#4B5563" multiline />
        <View style={styles.switchRow}><Text style={styles.sectionLabel}>Enabled</Text><Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#333', true: '#8B5CF6' }} thumbColor={enabled ? '#A78BFA' : '#666'} /></View>
        <Text style={styles.sectionLabel}>Trigger</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowTriggerPicker(!showTriggerPicker)}><Ionicons name={TRIGGER_TYPES.find(t => t.value === trigger.type)?.icon as any || 'flash-outline'} size={20} color="#8B5CF6" /><Text style={styles.selectorText}>{TRIGGER_TYPES.find(t => t.value === trigger.type)?.label || trigger.type}</Text><Ionicons name={showTriggerPicker ? 'chevron-up' : 'chevron-down'} size={18} color="#6B7280" /></TouchableOpacity>
        {showTriggerPicker && (<View style={styles.pickerGrid}>{TRIGGER_TYPES.map((t) => (<TouchableOpacity key={t.value} style={[styles.pickerItem, trigger.type === t.value && styles.pickerItemActive]} onPress={() => { setTrigger({ type: t.value } as TriggerConfig); setShowTriggerPicker(false); }}><Ionicons name={t.icon as any} size={16} color={trigger.type === t.value ? '#8B5CF6' : '#9CA3AF'} /><Text style={[styles.pickerItemText, trigger.type === t.value && styles.pickerItemTextActive]}>{t.label}</Text></TouchableOpacity>))}</View>)}
        {trigger.type === 'time_schedule' && <View style={styles.triggerConfig}><Text style={styles.configLabel}>Cron Expression (m h dom mon dow)</Text><TextInput style={styles.configInput} value={triggerDetails} onChangeText={(v) => { setTriggerDetails(v); setTrigger({ type: 'time_schedule', cron: v }); }} placeholder="0 9 * * *" placeholderTextColor="#4B5563" /></View>}
        {trigger.type === 'app_launched' && <View style={styles.triggerConfig}><Text style={styles.configLabel}>Package Name</Text><TextInput style={styles.configInput} value={triggerDetails} onChangeText={(v) => { setTriggerDetails(v); setTrigger({ type: 'app_launched', packageName: v }); }} placeholder="com.whatsapp" placeholderTextColor="#4B5563" /></View>}
        <Text style={styles.sectionLabel}>Steps ({steps.length})</Text>
        {steps.map((step, i) => renderActionConfig(step, i))}
        <TouchableOpacity style={styles.addStepBtn} onPress={() => setShowActionPicker(!showActionPicker)}><Ionicons name="add-circle" size={22} color="#8B5CF6" /><Text style={styles.addStepText}>Add Step</Text></TouchableOpacity>
        {showActionPicker && (<View style={styles.pickerGrid}>{ACTION_TYPES.map((a) => (<TouchableOpacity key={a.value} style={styles.pickerItem} onPress={() => addStep(a.value)}><Ionicons name={a.icon as any} size={14} color="#9CA3AF" /><Text style={styles.pickerItemText}>{a.label}</Text></TouchableOpacity>))}</View>)}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F30' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginTop: 20, marginBottom: 6 },
  mainInput: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14, color: '#F1F5F9', fontSize: 15, borderWidth: 1, borderColor: '#2A2A3E' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#2A2A3E', gap: 10 },
  selectorText: { flex: 1, fontSize: 15, color: '#F1F5F9' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8, padding: 8, backgroundColor: '#111122', borderRadius: 12 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#1A1A2E', gap: 6 },
  pickerItemActive: { backgroundColor: '#8B5CF622', borderWidth: 1, borderColor: '#8B5CF6' },
  pickerItemText: { fontSize: 12, color: '#9CA3AF' },
  pickerItemTextActive: { color: '#8B5CF6', fontWeight: '600' },
  triggerConfig: { marginTop: 8 },
  stepCard: { backgroundColor: '#1A1A2E', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#2A2A3E' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepType: { flex: 1, fontSize: 13, fontWeight: '600', color: '#D1D5DB' },
  stepConfig: { marginTop: 6 },
  configLabel: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  configInput: { backgroundColor: '#0F0F1A', borderRadius: 8, padding: 10, color: '#F1F5F9', fontSize: 13, borderWidth: 1, borderColor: '#2A2A3E' },
  rowBtns: { flexDirection: 'row', gap: 8 },
  dirBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0F0F1A', borderWidth: 1, borderColor: '#2A2A3E' },
  dirBtnActive: { backgroundColor: '#8B5CF622', borderColor: '#8B5CF6' },
  dirBtnText: { color: '#9CA3AF', fontSize: 12, textTransform: 'capitalize' },
  dirBtnTextActive: { color: '#8B5CF6' },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 8, borderWidth: 2, borderColor: '#2A2A3E', borderStyle: 'dashed', borderRadius: 12, gap: 8 },
  addStepText: { color: '#8B5CF6', fontSize: 15, fontWeight: '600' },
});
