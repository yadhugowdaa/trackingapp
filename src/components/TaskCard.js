import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GlassView } from '../components/GlassView';
import TagBadge from './TagBadge';
import ProgressBar from './ProgressBar';

export default function TaskCard({ task, tags = [], onDelete, onComplete, onEdit, onToggleMicroTask }) {
    const [showMicroTasks, setShowMicroTasks] = useState(false);

    const handleDelete = () => {
        onDelete(task.id);
    };

    const toggleComplete = () => {
        onComplete(task.id);
    };

    const handleMicroTaskToggle = (microTaskId) => {
        if (onToggleMicroTask) {
            onToggleMicroTask(task.id, microTaskId);
        }
    };

    return (
        <TouchableOpacity onPress={() => onEdit(task)} activeOpacity={0.9}>
            <GlassView
                style={[styles.card, task.status === 'completed' && styles.completedCard]}
                glowColor={
                    task.status === 'completed' ? 'rgba(52, 199, 89, 0.3)' :
                        task.priority === 'high' ? 'rgba(239, 68, 68, 0.3)' :
                            task.priority === 'medium' ? 'rgba(251, 146, 60, 0.3)' :
                                'rgba(34, 197, 94, 0.3)'
                }
            >
                <View style={styles.header}>
                    {/* Checkbox */}
                    <TouchableOpacity style={styles.checkbox} onPress={toggleComplete}>
                        <View style={[
                            styles.checkboxInner,
                            task.status === 'completed' && styles.checkboxCompleted
                        ]}>
                            {task.status === 'completed' && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>

                    {/* Task Info */}
                    <View style={styles.info}>
                        <Text style={[
                            styles.title,
                            task.status === 'completed' && styles.completedText
                        ]}>
                            {task.title}
                        </Text>
                        {task.description ? (
                            <Text style={[styles.description, task.status === 'completed' && styles.completedText]} numberOfLines={2}>
                                {task.description}
                            </Text>
                        ) : null}

                        {/* Tags */}
                        {task.tagIds && task.tagIds.length > 0 && (
                            <View style={styles.tags}>
                                {tags
                                    .filter(tag => task.tagIds.includes(tag.id))
                                    .slice(0, 3)
                                    .map(tag => (
                                        <TagBadge key={tag.id} tag={tag} size="small" />
                                    ))}
                                {task.tagIds.length > 3 && (
                                    <Text style={styles.moreTagsText}>+{task.tagIds.length - 3}</Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Priority Badge */}
                    {task.status !== 'completed' && (
                        <View style={[styles.priorityBadge, {
                            backgroundColor:
                                task.priority === 'high' ? '#FF3B30' :
                                    task.priority === 'medium' ? '#FF9500' :
                                        '#34C759'
                        }]}>
                            <Text style={styles.priorityText}>
                                {task.priority.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    {/* Micro-tasks Progress */}
                    {task.microTasks && task.microTasks.length > 0 && (
                        <TouchableOpacity
                            style={styles.progressContainer}
                            onPress={() => setShowMicroTasks(!showMicroTasks)}
                        >
                            <ProgressBar
                                completed={task.microTasks.filter(mt => mt.completed).length}
                                total={task.microTasks.length}
                                style={{ flex: 1, marginRight: 12 }}
                            />
                            <Text style={styles.expandIcon}>{showMicroTasks ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                    )}

                    {(!task.microTasks || task.microTasks.length === 0) && (
                        <Text style={[styles.deadline, task.status === 'completed' && styles.completedText]}>
                            ⏰ {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    )}

                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                </View>

                {/* Expandable Micro-tasks List */}
                {showMicroTasks && task.microTasks && task.microTasks.length > 0 && (
                    <View style={styles.microTasksList}>
                        {task.microTasks.map((mt) => (
                            <TouchableOpacity
                                key={mt.id}
                                style={styles.microTaskRow}
                                onPress={() => handleMicroTaskToggle(mt.id)}
                            >
                                <View style={[
                                    styles.microCheckbox,
                                    mt.completed && styles.microCheckboxCompleted
                                ]}>
                                    {mt.completed && <Text style={styles.microCheckmark}>✓</Text>}
                                </View>
                                <Text style={[
                                    styles.microTaskText,
                                    mt.completed && styles.microTaskTextCompleted
                                ]}>
                                    {mt.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </GlassView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 16,
    },
    completedCard: {
        opacity: 0.6,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    checkbox: {
        marginRight: 12,
        marginTop: 2,
    },
    checkboxInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxCompleted: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 20,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.7,
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    expandIcon: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginLeft: 8,
    },
    deadline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    deleteButton: {
        padding: 8,
    },
    deleteText: {
        fontSize: 14,
        color: 'rgba(255, 59, 48, 0.8)',
        fontWeight: '600',
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    moreTagsText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600',
    },
    microTasksList: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        gap: 8,
    },
    microTaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    microCheckbox: {
        width: 18,
        height: 18,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.4)',
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    microCheckboxCompleted: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    microCheckmark: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    microTaskText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    microTaskTextCompleted: {
        textDecorationLine: 'line-through',
        color: 'rgba(255,255,255,0.4)',
    },
});
