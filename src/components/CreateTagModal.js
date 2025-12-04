import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { GlassView } from './GlassView';

const PRESET_COLORS = [
    { name: 'Red', color: '#FF3B30' },
    { name: 'Orange', color: '#FF9500' },
    { name: 'Yellow', color: '#FFCC00' },
    { name: 'Green', color: '#34C759' },
    { name: 'Blue', color: '#007AFF' },
    { name: 'Purple', color: '#AF52DE' },
    { name: 'Brown', color: '#A2845E' },
    { name: 'Gray', color: '#8E8E93' },
];

export default function CreateTagModal({ visible, onClose, onCreateTag }) {
    const [tagName, setTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].color);

    const handleCreate = () => {
        if (!tagName.trim()) return;

        onCreateTag({
            id: Date.now().toString(),
            name: tagName.trim(),
            color: selectedColor,
        });

        setTagName('');
        setSelectedColor(PRESET_COLORS[0].color);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <GlassView style={styles.modal} glowColor="rgba(99, 102, 241, 0.4)">
                    <Text style={styles.title}>Create New Tag</Text>

                    {/* Tag Name Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Tag Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Work, Personal, Urgent"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={tagName}
                            onChangeText={setTagName}
                            autoFocus
                        />
                    </View>

                    {/* Color Picker */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Color</Text>
                        <View style={styles.colorGrid}>
                            {PRESET_COLORS.map((preset) => (
                                <TouchableOpacity
                                    key={preset.color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: preset.color },
                                        selectedColor === preset.color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => setSelectedColor(preset.color)}
                                >
                                    {selectedColor === preset.color && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Preview */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Preview</Text>
                        <View
                            style={[
                                styles.preview,
                                { backgroundColor: `${selectedColor}40`, borderColor: selectedColor }
                            ]}
                        >
                            <Text style={styles.previewText}>{tagName || 'Tag Name'}</Text>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: selectedColor }]}
                            onPress={handleCreate}
                            disabled={!tagName.trim()}
                        >
                            <Text style={styles.createText}>Create Tag</Text>
                        </TouchableOpacity>
                    </View>
                </GlassView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#FFFFFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    colorOption: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: '#FFFFFF',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    preview: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        alignSelf: 'flex-start',
    },
    previewText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    buttons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    cancelText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    createText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
