import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { GlassView } from './GlassView';
import TagBadge from './TagBadge';
import CreateTagModal from './CreateTagModal';

export default function TagPicker({ visible, onClose, allTags, selectedTagIds = [], onTagsChange, onCreateTag }) {
    const [showCreateTag, setShowCreateTag] = useState(false);

    const toggleTag = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter(id => id !== tagId));
        } else {
            onTagsChange([...selectedTagIds, tagId]);
        }
    };

    const handleCreateTag = (newTag) => {
        onCreateTag(newTag);
        onTagsChange([...selectedTagIds, newTag.id]);
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <GlassView style={styles.modal} glowColor="rgba(138, 99, 210, 0.4)">
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Select Tags</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.doneButton}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Selected Count */}
                        {selectedTagIds.length > 0 && (
                            <Text style={styles.selectedCount}>
                                {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''} selected
                            </Text>
                        )}

                        {/* Tag List */}
                        <ScrollView style={styles.tagList} showsVerticalScrollIndicator={false}>
                            <View style={styles.tagGrid}>
                                {allTags.map((tag) => {
                                    const isSelected = selectedTagIds.includes(tag.id);
                                    return (
                                        <TouchableOpacity
                                            key={tag.id}
                                            style={[
                                                styles.tagOption,
                                                {
                                                    backgroundColor: isSelected ? `${tag.color}60` : `${tag.color}20`,
                                                    borderColor: isSelected ? tag.color : 'rgba(255,255,255,0.2)',
                                                }
                                            ]}
                                            onPress={() => toggleTag(tag.id)}
                                        >
                                            <Text style={styles.tagText}>{tag.name}</Text>
                                            {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Create New Tag Button */}
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => setShowCreateTag(true)}
                            >
                                <Text style={styles.createButtonText}>+ Create New Tag</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </GlassView>
                </View>
            </Modal>

            {/* Create Tag Modal */}
            <CreateTagModal
                visible={showCreateTag}
                onClose={() => setShowCreateTag(false)}
                onCreateTag={handleCreateTag}
            />
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    doneButton: {
        fontSize: 16,
        color: '#0A84FF',
        fontWeight: '600',
    },
    selectedCount: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 16,
    },
    tagList: {
        maxHeight: 400,
    },
    tagGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    tagOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    createButton: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed',
        alignItems: 'center',
        marginTop: 8,
    },
    createButtonText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 15,
        fontWeight: '600',
    },
});
