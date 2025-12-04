import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { GlassView } from './GlassView';

export default function ProfileDropdown({ visible, onClose, user, onLogout }) {
    if (!visible) return null;

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.dropdownContainer}>
                            <GlassView style={styles.dropdown} glowColor="rgba(99, 102, 241, 0.3)">
                                <View style={styles.userInfo}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </Text>
                                    </View>
                                    <View style={styles.userDetails}>
                                        <Text style={styles.name}>{user?.name || 'User'}</Text>
                                        <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                                    <Text style={styles.logoutText}>Log Out</Text>
                                </TouchableOpacity>
                            </GlassView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 280,
    },
    dropdown: {
        padding: 16,
        borderRadius: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userDetails: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    email: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginBottom: 16,
    },
    logoutButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255, 59, 48, 0.15)',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 59, 48, 0.3)',
    },
    logoutText: {
        color: '#FF3B30',
        fontWeight: '600',
        fontSize: 14,
    },
});
