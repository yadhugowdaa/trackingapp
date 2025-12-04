import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import MicroTaskItem from './MicroTaskItem';
import ProgressBar from './ProgressBar';

export default function MicroTaskList({ microTasks, onChange }) {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddMicroTask = () => {
        if (!newTaskTitle.trim()) return;

        const newMicroTask = {
            id: `mt-${Date.now()}`,
            title: newTaskTitle.trim(),
            completed: false,
            timeSpent: 0,
            createdAt: new Date(),
        };

        onChange([...microTasks, newMicroTask]);
        setNewTaskTitle('');
    };

    const handleToggle = (id) => {
        onChange(
            microTasks.map((mt) =>
                mt.id === id ? { ...mt, completed: !mt.completed } : mt
            )
        );
    };

    const handleUpdate = (id, newTitle) => {
        onChange(
            microTasks.map((mt) => (mt.id === id ? { ...mt, title: newTitle } : mt))
        );
    };

    const handleDelete = (id) => {
        onChange(microTasks.filter((mt) => mt.id !== id));
    };

    const completedCount = microTasks.filter((mt) => mt.completed).length;
    const totalCount = microTasks.length;

    return (
        <View style={styles.container}>
            {/* Progress Bar (if micro-tasks exist) */}
            {totalCount > 0 && (
                <View style={styles.progressContainer}>
                    <ProgressBar completed={completedCount} total={totalCount} />
                </View>
            )}

            {/* Micro-task List */}
            <View style={styles.list}>
                {microTasks.map((microTask) => (
                    <MicroTaskItem
                        key={microTask.id}
                        microTask={microTask}
                        onToggle={handleToggle}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                    />
                ))}
            </View>

            {/* Add New Micro-task Input */}
            <View style={styles.addContainer}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="+ Add micro-task"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        onSubmitEditing={handleAddMicroTask}
                        returnKeyType="done"
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddMicroTask}
                        disabled={!newTaskTitle.trim()}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    progressContainer: {
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    list: {
        gap: 4,
    },
    addContainer: {
        marginTop: 8,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
    },
    addButton: {
        backgroundColor: 'rgba(52, 199, 89, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.4)',
    },
    addButtonText: {
        color: '#34C759',
        fontSize: 14,
        fontWeight: '600',
    },
});
