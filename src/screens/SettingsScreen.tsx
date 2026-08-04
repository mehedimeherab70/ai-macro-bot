// AI Macro Bot — Settings Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIConfig } from '../types';
import { clearLogs } from '../engine/macroEngine';

const SETTINGS_KEY = '@aimacrobot_settings';

export default function SettingsScreen() {
  const [aiConfig, setAiConfig] = useState<AIConfig>({ provider: 'openai', apiKey: '', baseUrl: '', model: 'gpt-4o-mini', vision: true });
  const [humanizationLevel, setHumanizationLevel] = useState<string>('medium');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => { (async () => { try { const raw = await AsyncStorage.getItem(SETTINGS_KEY); if (raw) { const s = JSON.parse(raw); if (s.aiConfig) setAiConfig(s.aiConfig); if (s.humanizationLevel) setHumanizationLevel(s.humanizationLevel); if (s.darkMode !== undefined) setDarkMode(s.darkMode); } } catch {} })(); }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ aiConfig, humanizationLevel, darkMode }));
    Alert.alert('✅ Saved', 'Settings saved.');
  };

  const providers: { value: AIConfig['provider']; label: string }[] = [{ value: 'openai', label: 'OpenAI (GPT-4o)' }, { value: 'anthropic', label: 'Anthropic (Claude)' }, { value: 'gemini', label: 'Google Gemini' }, { value: 'custom', label: 'Custom API' }];
  const levels: { value: string; label: string; desc: string }[] = [{ value: 'none', label: 'None', desc: 'Fast, direct execution' }, { value: 'low', label: 'Low', desc: 'Minimal delays' }, { value: 'medium', label: 'Medium', desc: 'Natural-looking timing' }, { value: 'high', label: 'High', desc: 'Maximum human simulation' }];

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Settings</Text></View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>🤖 AI Configuration</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Provider</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{providers.map((p) => (<TouchableOpacity key={p.value} style={[styles.providerBtn, aiConfig.provider === p.value && styles.providerBtnActive]} onPress={() => setAiConfig({ ...aiConfig, provider: p.value })}><Text style={[styles.providerBtnText, aiConfig.provider === p.value && { color: '#8B5CF6', fontWeight: '600' }]}>{p.label}</Text></TouchableOpacity>))}</View>
          <Text style={styles.label}>API Key</Text>
          <TextInput style={styles.input} value={aiConfig.apiKey} onChangeText={(v) => setAiConfig({ ...aiConfig, apiKey: v })} placeholder="sk-..." placeholderTextColor="#4B5563" secureTextEntry />
          {aiConfig.provider === 'custom' && <><Text style={styles.label}>Base URL</Text><TextInput style={styles.input} value={aiConfig.baseUrl} onChangeText={(v) => setAiConfig({ ...aiConfig, baseUrl: v })} placeholder="https://api.openai.com" placeholderTextColor="#4B5563" /></>}
          <Text style={styles.label}>Model</Text>
          <TextInput style={styles.input} value={aiConfig.model} onChangeText={(v) => setAiConfig({ ...aiConfig, model: v })} placeholder="gpt-4o-mini" placeholderTextColor="#4B5563" />
          <View style={styles.switchRow}><Text style={styles.label}>Vision (Screenshot)</Text><Switch value={aiConfig.vision} onValueChange={(v) => setAiConfig({ ...aiConfig, vision: v })} trackColor={{ false: '#333', true: '#8B5CF6' }} thumbColor={aiConfig.vision ? '#A78BFA' : '#666'} /></View>
        </View>

        <Text style={styles.sectionTitle}>👤 Humanization</Text>
        <View style={styles.card}>{levels.map((h) => (<TouchableOpacity key={h.value} style={[styles.humanizeRow, humanizationLevel === h.value && { backgroundColor: '#8B5CF611' }]} onPress={() => setHumanizationLevel(h.value)}><View style={styles.radio}>{humanizationLevel === h.value && <View style={styles.radioInner} />}</View><View><Text style={styles.humanizeLabel}>{h.label}</Text><Text style={styles.humanizeDesc}>{h.desc}</Text></View></TouchableOpacity>))}</View>

        <Text style={styles.sectionTitle}>💾 Data</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.dataBtn} onPress={async () => { Alert.alert('Clear Logs', 'Delete all execution logs?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: async () => { await clearLogs(); Alert.alert('Done', 'All logs cleared.'); } }]); }}><Ionicons name="trash-outline" size={20} color="#EF4444" /><Text style={{ fontSize: 14, color: '#EF4444' }}>Clear Execution Logs</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}><Ionicons name="save" size={20} color="#fff" /><Text style={styles.saveBtnText}>Save Settings</Text></TouchableOpacity>
        <View style={styles.about}><Text style={styles.aboutTitle}>AI Macro Bot</Text><Text style={styles.aboutVersion}>v1.0.0</Text><Text style={styles.aboutText}>AI-powered Android automation app.{'\n'}Built with React Native & Expo.</Text></View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F30' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  content: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#2A2A3E' },
  label: { fontSize: 13, color: '#9CA3AF', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0F0F1A', borderRadius: 10, padding: 12, color: '#F1F5F9', fontSize: 14, borderWidth: 1, borderColor: '#2A2A3E' },
  providerBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0F0F1A', borderWidth: 1, borderColor: '#2A2A3E' },
  providerBtnActive: { backgroundColor: '#8B5CF622', borderColor: '#8B5CF6' },
  providerBtnText: { fontSize: 12, color: '#9CA3AF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  humanizeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8B5CF6' },
  humanizeLabel: { fontSize: 14, fontWeight: '600', color: '#F1F5F9' },
  humanizeDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  dataBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 14, marginTop: 28, gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  about: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  aboutTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
  aboutVersion: { fontSize: 13, color: '#4B5563', marginTop: 4 },
  aboutText: { fontSize: 12, color: '#4B5563', textAlign: 'center', marginTop: 8, lineHeight: 18 },
});
