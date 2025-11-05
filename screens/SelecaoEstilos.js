// screens/SelecaoEstilos.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';
import { salvarEstilos } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function SelecaoEstilos({}) {
  const navigation = useNavigation();
  const [selecionados, setSelecionados] = useState([]);
  const estilos = [
    'gótico', 'casual', 'elegante', 'esportivo',
    'vintage', 'boho', 'minimalista', 'streetwear'
  ];

  const toggleEstilo = (estilo) => {
    if (selecionados.includes(estilo)) {
      setSelecionados(selecionados.filter(e => e !== estilo));
    } else if (selecionados.length < 5) {
      setSelecionados([...selecionados, estilo]);
    }
  };

  const handleContinuar = async () => {
    if (selecionados.length < 3) {
      alert('Escolha pelo menos 3 estilos.');
      return;
    }
    try {
      await salvarEstilos(auth.currentUser.uid, selecionados);
      navigation.replace('GuardaRoupa');
    } catch (error) {
      alert('Erro ao salvar estilos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha seus estilos</Text>
      <Text style={styles.subtitle}>Mínimo: 3 | Máximo: 5</Text>
      
      <View style={styles.chips}>
        {estilos.map(estilo => (
          <TouchableOpacity
            key={estilo}
            onPress={() => toggleEstilo(estilo)}
            style={[
              styles.chip,
              selecionados.includes(estilo) && styles.chipSelected
            ]}
          >
            <Text style={selecionados.includes(estilo) ? styles.chipTextSelected : styles.chipText}>
              {estilo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={`Continuar (${selecionados.length}/5)`}
        onPress={handleContinuar}
        disabled={selecionados.length < 3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 40 },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  chipSelected: {
    backgroundColor: '#000',
  },
  chipText: { color: '#000' },
  chipTextSelected: { color: '#fff', fontWeight: 'bold' }
});