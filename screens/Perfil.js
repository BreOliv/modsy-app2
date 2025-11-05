import React, { useState, useRef, useCallback } from 'react';
import {View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, Modal,  Animated,  Image,} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Perfil() {
  const navigation = useNavigation();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      console.log("Nenhum usuário logado");
      navigation.replace('Login');
      return;
    }

    console.log("Usuário logado:", auth.currentUser.email);
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("Documento encontrado:", data);
        const nomeFirestore = data.nome || '';
        const fallback = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuário';
        setNomeUsuario(nomeFirestore.trim() !== '' ? nomeFirestore : fallback);
        setSavedOutfits(data.savedOutfits || []);
      } else {
        console.log("Documento não existe. Criando...");
        const fallbackName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuário';
        await setDoc(userDocRef, {
          nome: fallbackName,
          savedOutfits: [],
          createdAt: new Date(),
        });
        setNomeUsuario(fallbackName);
        setSavedOutfits([]);
      }
    } catch (error) {
      console.error("Erro crítico no fetchUserData:", error);
      Alert.alert("Erro", "Falha ao carregar perfil: " + (error.message || 'desconhecido'));
      setNomeUsuario('Usuário');
      setSavedOutfits([]);
    } finally {
      console.log("Finalizando carregamento");
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleEditarEstilos = () => {
    setIsMenuVisible(false);
    navigation.navigate('SelecaoEstilos');
  };

  const handleLogout = async () => {
    setIsMenuVisible(false);
    await auth.signOut();
    navigation.replace('Login');
  };

  const openMenu = () => {
    setIsMenuVisible(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false }).start();
  };

  const closeMenu = () => {
    Animated.spring(slideAnim, { toValue: 300, useNativeDriver: false }).start(() => setIsMenuVisible(false));
  };

  const renderOutfitItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.outfitCard}
      onPress={() => Alert.alert('Look', item.name || 'Sem nome')}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.outfitImage} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>?</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text> 
        </TouchableOpacity>
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder} />
          <Text style={styles.profileName}>{nomeUsuario}</Text>
          <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
          <Text style={styles.outfitCount}>{savedOutfits.length} Outfits</Text>
        </View>
        <TouchableOpacity onPress={openMenu}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      ) : (
        <FlatList
          data={savedOutfits}
          renderItem={renderOutfitItem}
          keyExtractor={(item, i) => i.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text>Você não salvou nenhum look ainda.</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu} />
        <Animated.View style={[styles.menuContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Configurações</Text>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              closeMenu();
              navigation.navigate('EditarPerfil');
            }}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditarEstilos}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>🎨</Text>
            </View>
            <Text style={styles.menuText}>Editar Gostos</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              closeMenu();
              Alert.alert('Gerenciamento de Conta', 'Em breve!');
            }}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.menuText}>Gerenciamento de Conta</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              closeMenu();
              Alert.alert('Ajuda', 'Entre em contato com nosso suporte.');
            }}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.iconText}>❓</Text>
            </View>
            <Text style={styles.menuText}>Ajuda</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#f44336' }]}>
              <Text style={{ fontSize: 18, color: '#fff' }}>🚪</Text>
            </View>
            <Text style={[styles.menuText, { color: '#f44336' }]}>Sair da Conta</Text>
            <Text style={[styles.arrow, { color: '#f44336' }]}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#9c88ff' },
  profileHeader: { alignItems: 'center' },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', marginBottom: 8 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  profileEmail: { fontSize: 14, color: '#eee' },
  outfitCount: { fontSize: 12, color: '#fff', marginTop: 4 },
  backIcon: { fontSize: 20, color: '#fff' },
  settingsIcon: { fontSize: 20, color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666' },
  gridContent: { padding: 10 },
  outfitCard: { flex: 1, margin: 5, aspectRatio: 1, backgroundColor: '#fff', borderRadius: 8 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 24, color: '#aaa' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9c88ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 18,
    color: '#fff',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
});