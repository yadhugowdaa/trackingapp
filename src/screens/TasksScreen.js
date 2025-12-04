import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassView } from '../components/GlassView';
import TaskCard from '../components/TaskCard';
import CreateTaskScreen from './CreateTaskScreen';
import AnalyticsScreen from './AnalyticsScreen';
import RewardsScreen from './RewardsScreen';
import TagBadge from '../components/TagBadge';
import ProfileDropdown from '../components/ProfileDropdown';
import ProfileScreen from './ProfileScreen';
import { DEFAULT_APPS } from '../utils/rewards';
import AppBlocker from '../native/AppBlocker';

const STORAGE_KEYS = {
    TASKS: '@ikykik_tasks',
    TAGS: '@ikykik_tags',
    APP_USAGE: '@ikykik_app_usage',
};

export default function TasksScreen({ user, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [tags, setTags] = useState([
        { id: '1', name: 'Work', color: '#34C759' },
        { id: '2', name: 'Personal', color: '#007AFF' },
        { id: '3', name: 'Urgent', color: '#FF3B30' },
    ]);
    const [selectedFilterTag, setSelectedFilterTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showApps, setShowApps] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize app usage state with default apps
    const [appUsage, setAppUsage] = useState(
        DEFAULT_APPS.map(app => ({
            ...app,
            usedToday: 0,
            lastResetDate: new Date().toDateString(),
            dailyLimit: 30, // Default 30 min limit
        }))
    );

    // Load saved data on mount
    useEffect(() => {
        loadStoredData();
    }, []);

    // Save tasks whenever they change
    useEffect(() => {
        if (!isLoading && tasks.length >= 0) {
            saveTasks();
        }
    }, [tasks, isLoading]);

    const loadStoredData = async () => {
        try {
            const [storedTasks, storedTags, storedAppUsage] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.TASKS),
                AsyncStorage.getItem(STORAGE_KEYS.TAGS),
                AsyncStorage.getItem(STORAGE_KEYS.APP_USAGE),
            ]);

            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
            if (storedTags) {
                setTags(JSON.parse(storedTags));
            }
            if (storedAppUsage) {
                setAppUsage(JSON.parse(storedAppUsage));
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTasks = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    };

    const handleCreateTask = async (taskData) => {
        const newTask = {
            ...taskData,
            userId: user?.id || 'temp',
            createdAt: new Date().toISOString(),
        };

        setTasks([...tasks, newTask]);
        setShowCreateTask(false);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
    };

    const handleUpdateTask = (taskData) => {
        setTasks(tasks.map(t =>
            t.id === editingTask.id
                ? { ...t, ...taskData }
                : t
        ));
        setEditingTask(null);
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(t => t.id !== taskId));
    };

    const handleCompleteTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        if (newStatus === 'completed') {
            // Stop native app blocking when task is completed
            if (task.lockedAppIds && task.lockedAppIds.length > 0 && AppBlocker.isSupported()) {
                await AppBlocker.stopBlocking();
            }

            Alert.alert(
                '🎉 Task Completed!',
                'Great job! All blocked apps are now unlocked.',
                [{ text: 'Awesome!' }]
            );
        }

        setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus } : t
        ));
    };

    const handleToggleMicroTask = (taskId, microTaskId) => {
        setTasks(tasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    microTasks: t.microTasks.map(mt =>
                        mt.id === microTaskId ? { ...mt, completed: !mt.completed } : mt
                    )
                };
            }
            return t;
        }));
    };

    const handleCreateTag = (newTag) => {
        setTags([...tags, newTag]);
    };

    const activeTasks = tasks.filter(t => t.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    // Filter by tag and search query
    const filteredTasks = tasks.filter(t => {
        const matchesTag = selectedFilterTag ? t.tagIds?.includes(selectedFilterTag) : true;
        const matchesSearch = searchQuery
            ? t.title.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesTag && matchesSearch;
    });

    // Sort: pending first, then by deadline
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    return (
        <View style={styles.container}>
            {/* Header - Plato Style */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => setShowProfile(true)} style={styles.avatarButton}>
                        <View style={styles.avatarSmall}>
                            <Text style={styles.avatarText}>
                                {user?.email ? user.email[0].toUpperCase() : 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.appTitle}>IKYKIK</Text>
                        <Text style={styles.userSubtitle}>{user?.email || 'Tasks'}</Text>
                    </View>
                </View>

                <View style={styles.headerButtons}>
                    <TouchableOpacity onPress={() => setShowApps(true)} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>My Apps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowAnalytics(true)} style={styles.iconButton}>
                        <Text style={styles.iconButtonText}>Stats</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Profile Modal */}
            <Modal
                visible={showProfile}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setShowProfile(false)}
            >
                <ProfileScreen
                    user={user}
                    tasks={tasks}
                    onClose={() => setShowProfile(false)}
                    onLogout={onLogout}
                />
            </Modal>

            {/* Tasks Container */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <GlassView style={styles.searchContainer} glowColor="rgba(255, 255, 255, 0.1)">
                    <Text style={styles.searchIcon}>Search</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search tasks..."
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </GlassView>

                {/* Tag Filter Chips */}
                {tags.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagFilters}>
                        <TouchableOpacity
                            style={[
                                styles.filterChip,
                                !selectedFilterTag && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFilterTag(null)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                !selectedFilterTag && styles.filterChipTextActive
                            ]}>All</Text>
                        </TouchableOpacity>
                        {tags.map(tag => (
                            <TouchableOpacity
                                key={tag.id}
                                style={[
                                    styles.filterChip,
                                    selectedFilterTag === tag.id && {
                                        backgroundColor: `${tag.color}60`,
                                        borderColor: tag.color,
                                    }
                                ]}
                                onPress={() => setSelectedFilterTag(tag.id)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    selectedFilterTag === tag.id && styles.filterChipTextActive
                                ]}>{tag.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <GlassView style={styles.statCard} glowColor="rgba(99, 179, 237, 0.3)">
                        <Text style={styles.statNumber}>{activeTasks}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </GlassView>
                    <GlassView style={styles.statCard} glowColor="rgba(52, 199, 89, 0.3)">
                        <Text style={styles.statNumber}>{completedTasks}</Text>
                        <Text style={styles.statLabel}>Done</Text>
                    </GlassView>
                </View>

                {/* Main Card or Task List */}
                {filteredTasks.length === 0 ? (
                    <GlassView style={styles.mainCard} glowColor="rgba(138, 99, 210, 0.4)">
                        <Text style={styles.cardTitle}>Your tasks</Text>
                        <Text style={styles.emptyText}>{selectedFilterTag ? 'No tasks with this tag' : 'No tasks yet'}</Text>
                        <Text style={styles.emptySubtext}>{selectedFilterTag ? 'Try a different filter' : 'Tap below to create your first task'}</Text>
                    </GlassView>
                ) : (
                    <View style={styles.taskList}>
                        {sortedTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                tags={tags}
                                onDelete={handleDeleteTask}
                                onComplete={handleCompleteTask}
                                onEdit={handleEditTask}
                                onToggleMicroTask={handleToggleMicroTask}
                            />
                        ))}
                    </View>
                )}

                {/* Add Task Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    activeOpacity={0.8}
                    onPress={() => setShowCreateTask(true)}
                >
                    <GlassView style={styles.addButtonInner} glowColor="rgba(99, 102, 241, 0.5)">
                        <Text style={styles.addButtonText}>+ Add New Task</Text>
                    </GlassView>
                </TouchableOpacity>
            </ScrollView>

            {/* Create Task Modal */}
            <Modal
                visible={showCreateTask}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateTask(false)}
            >
                <CreateTaskScreen
                    onClose={() => setShowCreateTask(false)}
                    onCreateTask={handleCreateTask}
                    allTags={tags}
                    onCreateTag={handleCreateTag}
                    blockedApps={appUsage} // Pass all apps for selection
                />
            </Modal>

            {/* Edit Task Modal */}
            <Modal
                visible={!!editingTask}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setEditingTask(null)}
            >
                {editingTask && (
                    <CreateTaskScreen
                        onClose={() => setEditingTask(null)}
                        onCreateTask={handleUpdateTask}
                        initialTask={editingTask}
                        isEditing
                        allTags={tags}
                        onCreateTag={handleCreateTag}
                        blockedApps={appUsage}
                    />
                )}
            </Modal>

            {/* Analytics Modal */}
            <Modal
                visible={showAnalytics}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAnalytics(false)}
            >
                <AnalyticsScreen tasks={tasks} onClose={() => setShowAnalytics(false)} />
            </Modal>

            {/* Apps / Rewards Modal */}
            <Modal
                visible={showApps}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowApps(false)}
            >
                <RewardsScreen
                    appUsage={appUsage}
                    tasks={tasks}
                    onUpdateAppUsage={(appId, updates) => {
                        setAppUsage(prev => prev.map(app =>
                            app.id === appId ? { ...app, ...updates } : app
                        ));
                    }}
                    onClose={() => setShowApps(false)}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarButton: {
        marginRight: 12,
    },
    avatarSmall: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 2,
        borderColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerTitleContainer: {
        flex: 1,
    },
    appTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    userSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    userInfo: {
        flex: 1,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconButtonText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 20,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 12,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        padding: 0,
    },
    clearIcon: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
        padding: 4,
    },
    content: {
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 6,
        fontWeight: '500',
    },
    mainCard: {
        padding: 40,
        borderRadius: 28,
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    taskList: {
        marginBottom: 24,
    },
    addButton: {
        marginBottom: 40,
    },
    addButtonInner: {
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    tagFilters: {
        marginBottom: 20,
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        marginRight: 12,
    },
    filterChipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterChipText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
});
