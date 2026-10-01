import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Link as ExpoLink, useRouter } from 'expo-router';
import { authApi } from '../../api/auth';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setError('');
    if (!name || !email || !phone || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.signup({ name, email, phone, password });
      // Signup successful. Now they need to login.
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
      </TouchableOpacity>
      
      <ExpoLink href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ExpoLink>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
  linkButton: { alignItems: 'center' },
  linkText: { color: '#007AFF', fontSize: 16, marginTop: 10 },
});
