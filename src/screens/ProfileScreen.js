import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { GlassView } from '../components/GlassView';

export default function ProfileScreen({ user, tasks = [], onClose, onLogout }) {
    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.email) return 'U';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email[0].toUpperCase();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{getInitials()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <GlassView style={styles.statCard} glowColor="rgba(99, 179, 237, 0.3)">
                        <Text style={styles.statNumber}>{totalTasks}</Text>
                        <Text style={styles.statLabel}>Total Tasks</Text>
                    </GlassView>
                    <GlassView style={styles.statCard} glowColor="rgba(52, 199, 89, 0.3)">
                        <Text style={styles.statNumber}>{completedTasks}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </GlassView>
                    <GlassView style={styles.statCard} glowColor="rgba(255, 149, 0, 0.3)">
                        <Text style={styles.statNumber}>{pendingTasks}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </GlassView>
                </View>

                {/* Completion Rate */}
                <GlassView style={styles.rateCard} glowColor="rgba(138, 99, 210, 0.3)">
                    <Text style={styles.rateLabel}>Completion Rate</Text>
                    <View style={styles.rateBarContainer}>
                        <View style={[styles.rateBarFill, { width: `${completionRate}%` }]} />
                    </View>
                    <Text style={styles.ratePercent}>{completionRate}%</Text>
                </GlassView>

                {/* Account Section */}
                <GlassView style={styles.accountSection} glowColor="rgba(255, 59, 48, 0.2)">
                    <Text style={styles.sectionTitle}>Account</Text>

                    <View style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Email</Text>
                        <Text style={styles.menuItemValue}>{user?.email || '-'}</Text>
                    </View>

                    <View style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Name</Text>
                        <Text style={styles.menuItemValue}>{user?.name || 'Not set'}</Text>
                    </View>

                    <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={onLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </GlassView>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0f',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },
    backButton: {
        fontSize: 16,
        color: '#0A84FF',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarLarge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        borderWidth: 3,
        borderColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarTextLarge: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
        fontWeight: '500',
    },
    rateCard: {
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    rateLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 12,
        fontWeight: '600',
    },
    rateBarContainer: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    rateBarFill: {
        height: '100%',
        backgroundColor: '#34C759',
        borderRadius: 4,
    },
    ratePercent: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    accountSection: {
        padding: 20,
        borderRadius: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    menuItemText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    menuItemArrow: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.4)',
    },
    logoutItem: {
        borderBottomWidth: 0,
        marginTop: 8,
    },
    logoutText: {
        fontSize: 15,
        color: '#FF3B30',
        fontWeight: '600',
    },
    menuItemValue: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
    },
});
