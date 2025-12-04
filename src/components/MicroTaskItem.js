import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

export default function MicroTaskItem({ microTask, onToggle, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(microTask.title);

    const handleSave = () => {
        if (editedTitle.trim()) {
            onUpdate(microTask.id, editedTitle.trim());
            setIsEditing(false);
        }
    };

    const formatTime = (seconds) => {
        if (seconds === 0) return '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };

    return (
        <View style={styles.container}>
            {/* Checkbox */}
            <TouchableOpacity style={styles.checkbox} onPress={() => onToggle(microTask.id)}>
                <View style={[
                    styles.checkboxInner,
                    microTask.completed && styles.checkboxCompleted
                ]}>
                    {microTask.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
            </TouchableOpacity>

            {/* Title */}
            {isEditing ? (
                <TextInput
                    style={styles.input}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    onBlur={handleSave}
                    onSubmitEditing={handleSave}
                    autoFocus
                />
            ) : (
                <TouchableOpacity
                    style={styles.titleContainer}
                    onPress={() => setIsEditing(true)}
                    onLongPress={() => setIsEditing(true)}
                >
                    <Text style={[
                        styles.title,
                        microTask.completed && styles.completedText
                    ]}>
                        {microTask.title}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Time (if any) */}
            {microTask.timeSpent > 0 && (
                <Text style={styles.time}>{formatTime(microTask.timeSpent)}</Text>
            )}

            {/* Delete Button */}
            <TouchableOpacity onPress={() => onDelete(microTask.id)} style={styles.deleteButton}>
                <Text style={styles.deleteIcon}>×</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 12,
    },
    checkbox: {
        width: 20,
        height: 20,
    },
    checkboxInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxCompleted: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#FFFFFF',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    time: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    deleteButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteIcon: {
        fontSize: 24,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '300',
    },
});
