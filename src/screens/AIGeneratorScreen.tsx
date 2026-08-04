// AI Macro Bot — AI Generator Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Macro, AIConfig } from '../types';
import { generateMacro } from '../ai/aiService';
import { addMacro } from '../engine/macroEngine';

const SUGGESTIONS = [
  'Auto-reply to WhatsApp messages when I am driving',
  'Turn on WiFi and open YouTube when I get home',
  'Silence my phone during meetings (9AM-5PM weekdays)',
  'Send Good morning message to family every day at 7AM',
  'Turn off Bluetooth and WiFi when battery drops below 15%',
  'Take a screenshot and save when I shake my phone',
  'Auto-like Instagram posts when I open the app',
  'Read my notifications aloud when connected to car Bluetooth',
];

export default function AIGeneratorScreen() {
  const navigation = useNavigation<any>();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedMacro, setGeneratedMacro] = useState<Macro | null>(null);
  const [aiConfig] = useState<AIConfig>({ provider: 'openai', apiKey: '', model: 'gpt-4o-mini', vision: true });

  const handleGenerate = async (description?: string) => {
    const desc = description || prompt.trim();
    if (!desc) return;
    if (!aiConfig.apiKey) { Alert.alert('AI Not Configured', 'Please set up your AI API key in Settings first.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Settings', onPress: () => navigation.navigate('Settings') }]); return; }
    setLoading(true);
    try { const macro = await generateMacro(aiConfig, desc); if (macro) setGeneratedMacro(macro); else Alert.alert('Error', 'Failed to generate.'); }
    catch (err: any) { Alert.alert('Failed', err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!generatedMacro) return;
    await addMacro(generatedMacro);
    Alert.alert('✅ Saved!', `"${generatedMacro.name}" saved.`, [{ text: 'View Macros', onPress: () => navigation.navigate('Home') }, { text: 'Stay' }]);
    setGeneratedMacro(null); setPrompt('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>AI Macro Generator</Text><View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.aiHero}>
          <View style={styles.aiIconCircle}><Ionicons name="sparkles" size={40} color="#8B5CF6" /></View>
          <Text style={styles.aiHeroTitle}>Describe Your Macro</Text>
          <Text style={styles.aiHeroText}>Tell the AI what you want to automate and it will generate a complete macro.</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput style={styles.textInput} placeholder='e.g. "Open Spotify when I connect to car Bluetooth"' placeholderTextColor="#4B5563" value={prompt} onChangeText={setPrompt} multiline numberOfLines={3} textAlignVertical="top" />
          <TouchableOpacity style={[styles.generateBtn, !prompt.trim() && { opacity: 0.5 }]} onPress={() => handleGenerate()} disabled={!prompt.trim() || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="sparkles" size={20} color="#fff" /><Text style={styles.generateBtnText}>Generate Macro</Text></>}
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>💡 Quick Suggestions</Text>
        <View style={styles.suggestionsGrid}>{SUGGESTIONS.map((s, i) => (<TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleGenerate(s)} disabled={loading}><Ionicons name="bulb-outline" size={14} color="#FBBF24" /><Text style={styles.suggestionText} numberOfLines={2}>{s}</Text></TouchableOpacity>))}</View>
        {generatedMacro && (
          <View style={styles.resultCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}><Ionicons name="checkmark-circle" size={24} color="#10B981" /><Text style={{ fontSize: 18, fontWeight: '700', color: '#10B981' }}>Generated Macro</Text></View>
            <Text style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Name</Text>
            <Text style={{ fontSize: 14, color: '#D1D5DB', marginBottom: 10 }}>{generatedMacro.name}</Text>
            <Text style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Description</Text>
            <Text style={{ fontSize: 14, color: '#D1D5DB', marginBottom: 10 }}>{generatedMacro.description || 'N/A'}</Text>
            <Text style={{ fontSize: 11, color: '#6B7280', textTransform: 'uppercase' }}>Steps ({generatedMacro.steps.length})</Text>
            {generatedMacro.steps.map((step, i) => (<Text key={step.id} style={{ fontSize: 13, color: '#9CA3AF', marginLeft: 8 }}>{i + 1}. {step.action.type}</Text>))}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
              <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, gap: 8 }} onPress={handleSave}><Ionicons name="save" size={18} color="#fff" /><Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Save Macro</Text></TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#8B5CF6', gap: 8 }} onPress={() => setGeneratedMacro(null)}><Ionicons name="refresh" size={18} color="#8B5CF6" /><Text style={{ color: '#8B5CF6', fontWeight: '700', fontSize: 15 }}>Retry</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F30' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 20 },
  aiHero: { alignItems: 'center', paddingVertical: 20 },
  aiIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#8B5CF644' },
  aiHeroTitle: { fontSize: 20, fontWeight: '700', color: '#F1F5F9', marginTop: 16 },
  aiHeroText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6 },
  inputContainer: { marginTop: 8 },
  textInput: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, color: '#F1F5F9', fontSize: 15, borderWidth: 1, borderColor: '#2A2A3E', minHeight: 90 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 14, marginTop: 12, gap: 8 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#F1F5F9', marginTop: 28, marginBottom: 12 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A3E', gap: 6, maxWidth: '100%' },
  suggestionText: { fontSize: 13, color: '#D1D5DB', flexShrink: 1 },
  resultCard: { backgroundColor: '#1A2E1A', borderRadius: 16, padding: 16, marginTop: 24, marginBottom: 40, borderWidth: 1, borderColor: '#10B98133' },
});
