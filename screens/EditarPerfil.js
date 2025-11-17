import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Imagens locais da pasta img - de 1 a 20
const AVATARS = [
  require('../img/1.png'),
  require('../img/2.png'),
  require('../img/3.png'),
  require('../img/4.png'),
  require('../img/5.png'),
  require('../img/6.png'),
  require('../img/7.png'),
  require('../img/8.png'),
  require('../img/9.png'),
  require('../img/10.png'),
  require('../img/11.png'),
  require('../img/12.png'),
  require('../img/13.png'),
  require('../img/14.png'),
  require('../img/15.png'),
  require('../img/16.png'),
  require('../img/17.png'),
  require('../img/18.png'),
  require('../img/19.png'),
  require('../img/20.png'),
];

export default function EditarPerfil() {
  const navigation = useNavigation();
  const [nome, setNome] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (!auth.currentUser) {
        navigation.goBack();
        return;
      }

      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNome(userData.nome || auth.currentUser.displayName || '');
          // Se já tiver um avatar salvo, usar ele, senão usar um aleatório
          if (userData.avatarIndex !== undefined) {
            setAvatarIndex(userData.avatarIndex);
          } else {
            setAvatarIndex(Math.floor(Math.random() * AVATARS.length));
          }
        } else {
          setNome(auth.currentUser.displayName || '');
          setAvatarIndex(Math.floor(Math.random() * AVATARS.length));
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
        setAvatarIndex(Math.floor(Math.random() * AVATARS.length));
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Função para pegar um avatar aleatório
  const getRandomAvatar = () => {
    return Math.floor(Math.random() * AVATARS.length);
  };

  const handleSalvar = async () => {
    if (!auth.currentUser) return;

    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      await updateDoc(userDocRef, {
        nome: nomeTrimmed,
        avatarIndex: avatarIndex, // SALVAR APENAS O ÍNDICE
      });
      
      Alert.alert('Sucesso', 'Seu perfil foi atualizado!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleSelecionarAvatar = (index) => {
    setAvatarIndex(index);
    setModalVisible(false);
  };

  const AvatarItem = ({ avatar, index }) => (
    <TouchableOpacity 
      style={[
        styles.avatarItem,
        avatarIndex === index && styles.avatarSelecionado
      ]} 
      onPress={() => handleSelecionarAvatar(index)}
    >
      <View style={styles.avatarImageContainer}>
        <Image 
          source={avatar} 
          style={styles.avatarPequeno}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando seu perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          style={[styles.doneButton, saving && { opacity: 0.6 }]}
          onPress={handleSalvar}
          disabled={saving}
        >
          <Text style={styles.doneText}>{saving ? 'Salvando...' : 'Feito'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <View style={styles.avatarImageContainer}>
            <Image
              source={AVATARS[avatarIndex]}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.editButtonText}>Editar Foto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome"
          placeholderTextColor="#999"
          editable={!saving}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={auth.currentUser?.email || ''}
          placeholder="Email"
          placeholderTextColor="#999"
          editable={false}
        />
        <Text style={styles.emailInfo}>
          O email não pode ser alterado
        </Text>
      </View>

      {/* Modal de seleção de avatares */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha seu Avatar</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              20 avatares disponíveis - Toque para selecionar
            </Text>
            
            <FlatList
              data={AVATARS}
              renderItem={({ item, index }) => (
                <AvatarItem avatar={item} index={index} />
              )}
              keyExtractor={(item, index) => index.toString()}
              numColumns={4}
              contentContainerStyle={styles.avatarGrid}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.randomButton}
              onPress={() => handleSelecionarAvatar(getRandomAvatar())}
            >
              <Text style={styles.randomButtonText}>Avatar Aleatório</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 40,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  doneButton: {
    backgroundColor: '#9c88ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#9c88ff',
    overflow: 'hidden',
  },
  avatarImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#9c88ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: '#9c88ff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  emailInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  avatarGrid: {
    padding: 5,
  },
  avatarItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    margin: 5,
  },
  avatarSelecionado: {
    borderColor: '#9c88ff',
    backgroundColor: '#f0edff',
    transform: [{ scale: 1.1 }],
  },
  avatarPequeno: {
    width: '100%',
    height: '100%',
  },
  randomButton: {
    backgroundColor: '#9c88ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  randomButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});