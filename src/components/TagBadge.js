import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TagBadge({ tag, size = 'medium', style }) {
    const sizeStyles = {
        small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11 },
        medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13 },
        large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 15 },
    };

    const currentSize = sizeStyles[size];

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: `${tag.color}40`, // 25% opacity
                    borderColor: tag.color,
                },
                { paddingHorizontal: currentSize.paddingHorizontal, paddingVertical: currentSize.paddingVertical },
                style
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { fontSize: currentSize.fontSize }
                ]}
                numberOfLines={1}
            >
                {tag.name}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 12,
        borderWidth: 1.5,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
