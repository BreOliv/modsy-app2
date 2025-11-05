import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Onboarding3({}) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vamos começar?</Text>
      <View style={styles.buttonRow}>
        <Button title="Criar conta" onPress={() => navigation.navigate('Cadastro')} />
        <Button title="Já tenho conta" onPress={() => navigation.navigate('Login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 30 }
});