import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { GlassView } from '../components/GlassView';
import { authService } from '../services/api';

export default function SignupScreen({ onNavigateLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await authService.register(email, password, name);
            Alert.alert('Success', 'Account created! Please login.', [
                { text: 'OK', onPress: onNavigateLogin }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Signup Failed', error.response?.data?.message || 'Could not connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <GlassView style={styles.card}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join IKYKIK today</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Choose a password"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={onNavigateLogin} style={styles.linkButton}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </GlassView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#0a0a0f',
    },
    card: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#FFF',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    button: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
});
