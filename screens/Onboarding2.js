import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Onboarding2({}) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looks inteligentes</Text>
      <Text style={styles.subtitle}>Monte combinações com o que você já tem</Text>
      <View style={styles.buttonRow}>
        <Button title="Voltar" onPress={() => navigation.navigate('Onboarding1')} />
        <Button title="Próximo" onPress={() => navigation.navigate('Onboarding3')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 20 }
});