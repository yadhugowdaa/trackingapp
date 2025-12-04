import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const GlassView = ({ children, style, intensity = 20, glowColor = 'rgba(138, 99, 210, 0.4)' }) => {
    return (
        <View style={[styles.container, style]}>
            {/* Glow effect behind card */}
            <View style={[StyleSheet.absoluteFill, styles.glowContainer]}>
                <LinearGradient
                    colors={[glowColor, 'transparent']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.glow}
                />
            </View>

            {/* Glass blur effect */}
            <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark" />

            {/* Dark gradient overlay for depth */}
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'rgba(0,0,0,0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'rgba(20, 20, 30, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 15,
    },
    glowContainer: {
        borderRadius: 24,
    },
    glow: {
        flex: 1,
        opacity: 0.6,
        transform: [{ scale: 1.05 }],
    },
    content: {
        zIndex: 10,
    },
});
