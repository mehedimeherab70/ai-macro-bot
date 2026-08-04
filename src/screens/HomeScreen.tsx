// AI Macro Bot — Home Screen (Macro List)
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Macro } from '../types';
import { loadMacros, toggleMacro, deleteMacro, duplicateMacro, runMacro } from '../engine/macroEngine';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [macros, setMacros] = useState<Macro[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refreshMacros = useCallback(async () => { const loaded = await loadMacros(); setMacros(loaded.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); }, []);

  useFocusEffect(useCallback(() => { refreshMacros(); }, [refreshMacros]));

  const handleRefresh = async () => { setRefreshing(true); await refreshMacros(); setRefreshing(false); };
  const handleToggle = async (id: string) => { await toggleMacro(id); await refreshMacros(); };

  const handleDelete = (macro: Macro) => {
    Alert.alert('Delete Macro', `Are you sure you want to delete "${macro.name}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMacro(macro.id); await refreshMacros(); } }]);
  };

  const handleDuplicate = async (macro: Macro) => { const copy = await duplicateMacro(macro.id); if (copy) await refreshMacros(); };

  const handleRun = async (macro: Macro) => {
    try {
      const result = await runMacro(macro);
      if (result.status === 'success') Alert.alert('✅ Success', `"${macro.name}" completed.`);
      else Alert.alert('❌ Failed', result.errorMessage || 'Macro execution failed.');
      await refreshMacros();
    } catch (err: any) { Alert.alert('Error', err.message); }
  };

  function formatTrigger(macro: Macro): string {
    const t = macro.trigger;
    switch (t.type) { case 'manual': return 'Manual'; case 'time_schedule': return '⏰ Time'; case 'app_launched': return '📱 App Launch'; case 'notification_received': return '🔔 Notif'; case 'battery_level': return '🔋 Battery'; case 'wifi_connected': return '📶 WiFi'; case 'screen_on': return '🖥 Screen On'; case 'screen_off': return '🖥 Screen Off'; case 'shake_device': return '📳 Shake'; case 'bluetooth_connected': return '🔵 BT'; default: return t.type; }
  }

  const renderMacro = ({ item }: { item: Macro }) => (
    <View style={styles.macroCard}>
      <View style={styles.macroHeader}>
        <View style={styles.macroInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.aiGenerated && <Ionicons name="sparkles" size={16} color="#8B5CF6" style={{ marginRight: 6 }} />}
            <Text style={styles.macroName} numberOfLines={1}>{item.name}</Text>
          </View>
          <View style={styles.macroMeta}>
            <View style={styles.triggerBadge}><Ionicons name="flash" size={10} color="#F59E0B" /><Text style={styles.triggerText}>{formatTrigger(item)}</Text></View>
            <Text style={styles.runCount}>▶ {item.runCount} runs</Text>
          </View>
        </View>
        <Switch value={item.enabled} onValueChange={() => handleToggle(item.id)} trackColor={{ false: '#333', true: '#8B5CF6' }} thumbColor={item.enabled ? '#A78BFA' : '#666'} />
      </View>
      {item.description ? <Text style={styles.description} numberOfLines={2}>{item.description}</Text> : null}
      <View style={styles.stepPreview}>
        <Ionicons name="list" size={14} color="#9CA3AF" /><Text style={styles.stepCount}>{item.steps.length} step{item.steps.length !== 1 ? 's' : ''}</Text>
        {item.constraints.length > 0 && <><Ionicons name="funnel" size={14} color="#9CA3AF" style={{ marginLeft: 8 }} /><Text style={styles.stepCount}>{item.constraints.length} constraints</Text></>}
      </View>
      <View style={styles.macroActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleRun(item)}><Ionicons name="play-circle" size={20} color="#10B981" /><Text style={styles.actionBtnText}>Run</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MacroEditor', { macroId: item.id })}><Ionicons name="create-outline" size={18} color="#60A5FA" /><Text style={styles.actionBtnText}>Edit</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDuplicate(item)}><Ionicons name="copy-outline" size={18} color="#FBBF24" /><Text style={styles.actionBtnText}>Copy</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}><Ionicons name="trash-outline" size={18} color="#EF4444" /><Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Del</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View><Text style={styles.title}>AI Macro Bot</Text><Text style={styles.subtitle}>{macros.length} macros · {macros.filter((m) => m.enabled).length} active</Text></View>
        <TouchableOpacity style={styles.aiBtn} onPress={() => navigation.navigate('AIGenerator')}><Ionicons name="sparkles" size={20} color="#fff" /><Text style={styles.aiBtnText}>AI</Text></TouchableOpacity>
      </View>
      {macros.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="flash-outline" size={80} color="#333" />
          <Text style={styles.emptyTitle}>No Macros Yet</Text>
          <Text style={styles.emptyText}>Create your first automation macro or{'\n'}let AI generate one for you!</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8 }} onPress={() => navigation.navigate('MacroEditor', {})}><Ionicons name="add-circle" size={20} color="#fff" /><Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Create Macro</Text></TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#8B5CF6' }} onPress={() => navigation.navigate('AIGenerator')}><Ionicons name="sparkles" size={20} color="#fff" /><Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>AI Generate</Text></TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList data={macros} renderItem={renderMacro} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListFooterComponent={() => (<TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('MacroEditor', {})}><Ionicons name="add" size={24} color="#8B5CF6" /><Text style={styles.addBtnText}>New Macro</Text></TouchableOpacity>)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F30' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  aiBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 6 },
  aiBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingBottom: 100 },
  macroCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A3E' },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  macroInfo: { flex: 1, marginRight: 12 },
  macroName: { fontSize: 17, fontWeight: '700', color: '#F1F5F9' },
  macroMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  triggerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A1A0A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, gap: 4 },
  triggerText: { fontSize: 11, color: '#F59E0B' },
  runCount: { fontSize: 11, color: '#6B7280' },
  description: { fontSize: 13, color: '#9CA3AF', marginTop: 8, lineHeight: 18 },
  stepPreview: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  stepCount: { fontSize: 12, color: '#9CA3AF' },
  macroActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#252540' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  actionBtnText: { fontSize: 12, color: '#D1D5DB', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#F1F5F9', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 2, borderColor: '#2A2A3E', borderStyle: 'dashed', borderRadius: 16, gap: 8 },
  addBtnText: { color: '#8B5CF6', fontSize: 16, fontWeight: '600' },
});
