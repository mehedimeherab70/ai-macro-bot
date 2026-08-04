// AI Macro Bot — Logs Screen
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExecutionLogEntry } from '../types';
import { loadLogs, clearLogs } from '../engine/macroEngine';

export default function LogsScreen() {
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const refreshLogs = useCallback(async () => { setLogs(await loadLogs()); }, []);
  useEffect(() => { refreshLogs(); }, [refreshLogs]);
  const handleRefresh = async () => { setRefreshing(true); await refreshLogs(); setRefreshing(false); };
  const getStatusColor = (s: string) => { switch (s) { case 'success': return '#10B981'; case 'failed': return '#EF4444'; case 'cancelled': return '#F59E0B'; default: return '#60A5FA'; } };
  const getStatusIcon = (s: string) => { switch (s) { case 'success': return 'checkmark-circle'; case 'failed': return 'close-circle'; case 'cancelled': return 'remove-circle'; default: return 'time'; } };
  const formatDuration = (e: ExecutionLogEntry) => { if (!e.completedAt) return '...'; const ms = new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime(); if (ms < 1000) return `${ms}ms`; if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`; return `${(ms / 60000).toFixed(1)}m`; };

  const renderLog = ({ item }: { item: ExecutionLogEntry }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <Ionicons name={getStatusIcon(item.status) as any} size={22} color={getStatusColor(item.status)} />
        <View style={{ flex: 1 }}><Text style={styles.logName} numberOfLines={1}>{item.macroName}</Text><Text style={styles.logMeta}>{item.stepResults.length} steps · {formatDuration(item)}</Text></View>
        <Text style={[styles.logStatus, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
      </View>
      {item.errorMessage && <Text style={styles.errorText}>{item.errorMessage}</Text>}
      <Text style={styles.logTime}>{new Date(item.startedAt).toLocaleString()}</Text>
      {item.stepResults.length > 0 && (<View style={styles.stepsBreakdown}>{item.stepResults.map((step) => (<View key={step.stepId} style={styles.stepRow}><Ionicons name={step.status === 'success' ? 'checkmark' : 'close'} size={12} color={step.status === 'success' ? '#10B981' : '#EF4444'} /><Text style={styles.stepActionType}>{step.actionType}</Text><Text style={styles.stepDuration}>{step.durationMs}ms</Text></View>))}</View>)}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}><View><Text style={styles.title}>Execution Log</Text><Text style={styles.subtitle}>{logs.length} entries</Text></View>{logs.length > 0 && <TouchableOpacity onPress={async () => { await clearLogs(); setLogs([]); }}><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>}</View>
      {logs.length === 0 ? (<View style={styles.empty}><Ionicons name="document-text-outline" size={60} color="#333" /><Text style={styles.emptyTitle}>No Logs Yet</Text><Text style={styles.emptyText}>Run a macro to see execution logs.</Text></View>) : (<FlatList data={logs} renderItem={renderLog} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />} showsVerticalScrollIndicator={false} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1F1F30' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  list: { padding: 16 },
  logCard: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A3E' },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logName: { fontSize: 15, fontWeight: '600', color: '#F1F5F9' },
  logMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  logStatus: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 6, backgroundColor: '#EF444411', padding: 8, borderRadius: 8 },
  logTime: { fontSize: 11, color: '#4B5563', marginTop: 8 },
  stepsBreakdown: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#252540' },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3, gap: 6 },
  stepActionType: { flex: 1, fontSize: 12, color: '#9CA3AF' },
  stepDuration: { fontSize: 11, color: '#6B7280', fontFamily: 'monospace' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#6B7280', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#4B5563', marginTop: 6 },
});
