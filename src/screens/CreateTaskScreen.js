import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { GlassView } from '../components/GlassView';
import DateTimePicker from '@react-native-community/datetimepicker';
import TagPicker from '../components/TagPicker';
import TagBadge from '../components/TagBadge';
import MicroTaskList from '../components/MicroTaskList';
import AppBlocker from '../native/AppBlocker';

export default function CreateTaskScreen({ onClose, onCreateTask, initialTask = null, isEditing = false, allTags = [], onCreateTag, blockedApps = [] }) {
    const [title, setTitle] = useState(initialTask?.title || '');
    const [description, setDescription] = useState(initialTask?.description || '');
    const [dateTime, setDateTime] = useState(initialTask?.dateTime ? new Date(initialTask.dateTime) : new Date());
    const [deadline, setDeadline] = useState(initialTask?.deadline ? new Date(initialTask.deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [priority, setPriority] = useState(initialTask?.priority || 'medium');
    const [tagIds, setTagIds] = useState(initialTask?.tagIds || []);
    const [microTasks, setMicroTasks] = useState(initialTask?.microTasks || []);
    const [lockedAppIds, setLockedAppIds] = useState(initialTask?.lockedAppIds || []);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date');
    const [showTagPicker, setShowTagPicker] = useState(false);

    // Native app blocking state
    const [installedApps, setInstalledApps] = useState([]);
    const [hasPermissions, setHasPermissions] = useState(false);

    const priorities = [
        { value: 'high', label: 'High', color: '#FF3B30' },
        { value: 'medium', label: 'Medium', color: '#FF9500' },
        { value: 'low', label: 'Low', color: '#34C759' },
    ];

    // Load installed apps on mount
    useEffect(() => {
        loadInstalledApps();
        checkPermissions();
    }, []);

    const loadInstalledApps = async () => {
        if (AppBlocker.isSupported()) {
            const apps = await AppBlocker.getInstalledApps();
            // Add color based on app names
            const appsWithColors = apps.map(app => ({
                id: app.packageName,
                name: app.appName,
                packageName: app.packageName,
                color: getAppColor(app.appName),
            }));
            setInstalledApps(appsWithColors);
        }
    };

    // Color palette for app avatars
    const APP_COLORS = [
        '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
        '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A',
        '#FF9800', '#FF5722', '#795548', '#607D8B',
    ];

    const getAppColor = (appName) => {
        let hash = 0;
        for (let i = 0; i < appName.length; i++) {
            hash = appName.charCodeAt(i) + ((hash << 5) - hash);
        };
        return APP_COLORS[Math.abs(hash) % APP_COLORS.length];
    };

    const getInitial = (name) => name.charAt(0).toUpperCase();

    const checkPermissions = async () => {
        if (AppBlocker.isSupported()) {
            const { hasUsageStats, hasOverlay } = await AppBlocker.checkPermissions();
            setHasPermissions(hasUsageStats && hasOverlay);
        }
    };

    const requestPermissions = async () => {
        Alert.alert(
            'Permissions Required',
            'To block apps, IKYKIK needs:\n\n1. Usage Access Permission\n2. Display Over Other Apps Permission\n\nYou will be taken to Settings to enable these.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Grant Permissions',
                    onPress: async () => {
                        AppBlocker.requestUsageStatsPermission();
                        setTimeout(() => {
                            AppBlocker.requestOverlayPermission();
                        }, 2000);
                    }
                }
            ]
        );
    };

    const handleCreate = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a task title');
            return;
        }

        const taskId = initialTask?.id || Date.now().toString();

        // Start native blocking if apps are selected
        if (lockedAppIds.length > 0 && AppBlocker.isSupported()) {
            const { hasUsageStats, hasOverlay } = await AppBlocker.checkPermissions();
            if (!hasUsageStats || !hasOverlay) {
                Alert.alert(
                    'Permissions Needed',
                    'To block apps, please grant the required permissions.',
                    [
                        { text: 'Skip Blocking', onPress: () => createTask(taskId, []) },
                        { text: 'Grant Permissions', onPress: requestPermissions }
                    ]
                );
                return;
            }

            // Start native blocking
            await AppBlocker.startBlocking(lockedAppIds, taskId);
        }

        createTask(taskId, lockedAppIds);
    };

    const createTask = (taskId, finalLockedAppIds) => {
        const taskData = {
            id: taskId,
            title: title.trim(),
            description: description.trim(),
            dateTime,
            deadline,
            priority,
            tagIds,
            microTasks,
            lockedAppIds: finalLockedAppIds,
            status: 'pending',
        };

        onCreateTask(taskData);
    };

    const selectedTags = allTags.filter(tag => tagIds.includes(tag.id));

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
                    <TouchableOpacity onPress={handleCreate}>
                        <Text style={styles.createButton}>{isEditing ? 'Save' : 'Create'}</Text>
                    </TouchableOpacity>
                </View>

                <GlassView style={styles.section} glowColor="rgba(99, 102, 241, 0.3)">
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Enter task title..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />
                </GlassView>

                <GlassView style={styles.section} glowColor="rgba(99, 102, 241, 0.2)">
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Add details..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </GlassView>

                <GlassView style={styles.section} glowColor="rgba(138, 99, 210, 0.3)">
                    <Text style={styles.label}>Start Date & Time</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => { setPickerMode('date'); setShowDatePicker(true); }}>
                            <Text style={styles.dateText}>{dateTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => { setPickerMode('time'); setShowDatePicker(true); }}>
                            <Text style={styles.dateText}>{dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </GlassView>

                <GlassView style={styles.section} glowColor="rgba(239, 68, 68, 0.3)">
                    <Text style={styles.label}>Deadline</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => { setPickerMode('date'); setShowDeadlinePicker(true); }}>
                            <Text style={styles.dateText}>{deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => { setPickerMode('time'); setShowDeadlinePicker(true); }}>
                            <Text style={styles.dateText}>{deadline.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </GlassView>

                <GlassView style={styles.section} glowColor="rgba(99, 179, 237, 0.3)">
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityContainer}>
                        {priorities.map((p) => (
                            <TouchableOpacity key={p.value} style={[styles.priorityButton, priority === p.value && { backgroundColor: p.color, borderColor: p.color }]} onPress={() => setPriority(p.value)}>
                                <Text style={[styles.priorityText, priority === p.value && styles.priorityTextActive]}>{p.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </GlassView>

                <GlassView style={styles.section} glowColor="rgba(175, 82, 222, 0.3)">
                    <Text style={styles.label}>Tags</Text>
                    <TouchableOpacity style={styles.tagSelector} onPress={() => setShowTagPicker(true)}>
                        {selectedTags.length > 0 ? (
                            <View style={styles.selectedTags}>
                                {selectedTags.map(tag => (<TagBadge key={tag.id} tag={tag} size="small" />))}
                            </View>
                        ) : (
                            <Text style={styles.tagPlaceholder}>+ Add Tags</Text>
                        )}
                    </TouchableOpacity>
                </GlassView>

                {/* Lock Apps Section */}
                <GlassView style={styles.section} glowColor="rgba(255, 59, 48, 0.2)">
                    <View style={styles.sectionHeader}>
                        <Text style={styles.label}>Lock Apps (Until Completed)</Text>
                        {!hasPermissions && AppBlocker.isSupported() && (
                            <TouchableOpacity onPress={requestPermissions} style={styles.permissionButton}>
                                <Text style={styles.permissionButtonText}>Grant Access</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {lockedAppIds.length > 0 && (
                        <Text style={styles.lockedCount}>
                            {lockedAppIds.length} app{lockedAppIds.length > 1 ? 's' : ''} will be blocked
                        </Text>
                    )}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.appSelector}>
                        {(installedApps.length > 0 ? installedApps : blockedApps).length > 0 ? (
                            (installedApps.length > 0 ? installedApps : blockedApps).map(app => {
                                const isLocked = lockedAppIds.includes(app.id);
                                return (
                                    <TouchableOpacity
                                        key={app.id}
                                        style={[
                                            styles.appOption,
                                            isLocked && styles.appOptionSelected
                                        ]}
                                        onPress={() => {
                                            if (isLocked) {
                                                setLockedAppIds(lockedAppIds.filter(id => id !== app.id));
                                            } else {
                                                setLockedAppIds([...lockedAppIds, app.id]);
                                            }
                                        }}
                                    >
                                        <View style={[styles.appAvatar, { backgroundColor: app.color || '#673AB7' }]}>
                                            <Text style={styles.appAvatarText}>{getInitial(app.name)}</Text>
                                        </View>
                                        <Text style={[
                                            styles.appOptionName,
                                            isLocked && styles.appOptionNameSelected
                                        ]} numberOfLines={1}>{app.name}</Text>
                                        {isLocked && (
                                            <View style={styles.lockBadge}>
                                                <Text style={styles.lockBadgeText}>LOCKED</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={styles.noAppsText}>
                                {AppBlocker.isSupported()
                                    ? 'Loading installed apps...'
                                    : 'App blocking only works on Android'}
                            </Text>
                        )}
                    </ScrollView>
                </GlassView>

                {/* Micro-tasks Section */}
                <GlassView style={styles.section} glowColor="rgba(52, 199, 89, 0.3)">
                    <Text style={styles.label}>Micro-tasks</Text>
                    <MicroTaskList microTasks={microTasks} onChange={setMicroTasks} />
                </GlassView>

                {showDatePicker && (
                    <DateTimePicker value={dateTime} mode={pickerMode} is24Hour={false} onChange={(event, selectedDate) => { setShowDatePicker(false); if (selectedDate) setDateTime(selectedDate); }} />
                )}
                {showDeadlinePicker && (
                    <DateTimePicker value={deadline} mode={pickerMode} is24Hour={false} onChange={(event, selectedDate) => { setShowDeadlinePicker(false); if (selectedDate) setDeadline(selectedDate); }} />
                )}
            </ScrollView>

            <TagPicker visible={showTagPicker} onClose={() => setShowTagPicker(false)} allTags={allTags} selectedTagIds={tagIds} onTagsChange={setTagIds} onCreateTag={onCreateTag} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
    cancelButton: { fontSize: 16, color: 'rgba(255,255,255,0.6)' },
    createButton: { fontSize: 16, color: '#0A84FF', fontWeight: '600' },
    section: { padding: 20, borderRadius: 20, marginBottom: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    label: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    titleInput: { fontSize: 24, color: '#FFFFFF', fontWeight: '600' },
    descriptionInput: { fontSize: 16, color: '#FFFFFF', minHeight: 100, textAlignVertical: 'top' },
    dateButton: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    dateTimeRow: { flexDirection: 'row', gap: 12 },
    dateText: { fontSize: 15, color: '#FFFFFF', fontWeight: '500', textAlign: 'center' },
    priorityContainer: { flexDirection: 'row', gap: 12 },
    priorityButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
    priorityText: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
    priorityTextActive: { color: '#FFFFFF' },
    tagSelector: { padding: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'dashed' },
    selectedTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tagPlaceholder: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '500' },
    permissionButton: {
        backgroundColor: 'rgba(255, 59, 48, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    permissionButtonText: { color: '#FF3B30', fontSize: 12, fontWeight: '600' },
    lockedCount: {
        color: '#FF3B30',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    appSelector: { flexDirection: 'row' },
    appOption: {
        width: 80,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        marginRight: 10,
    },
    appOptionSelected: {
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        borderColor: '#FF3B30',
    },
    appAvatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    appAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    appOptionName: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    appOptionNameSelected: { color: '#FFFFFF', fontWeight: 'bold' },
    lockBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FF3B30',
        borderRadius: 6,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    lockBadgeText: { fontSize: 8, color: '#FFFFFF', fontWeight: 'bold' },
    noAppsText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' },
});

