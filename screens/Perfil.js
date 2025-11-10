import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faGear, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      navigation.replace('Login');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const nomeFirestore = data.nome || '';
        const fallback = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuário';
        setNomeUsuario(nomeFirestore.trim() !== '' ? nomeFirestore : fallback);
        setSavedOutfits(data.savedOutfits || []);
      } else {
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
      Alert.alert("Erro", "Falha ao carregar perfil: " + (error.message || 'desconhecido'));
      setNomeUsuario('Usuário');
      setSavedOutfits([]);
    } finally {
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

  const renderOutfitCard = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.outfitCard}
      onPress={() => {
        if (item && item.name) {
          Alert.alert('Look', item.name);
        }
      }}
    >
      {item && item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.outfitImage} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </TouchableOpacity>
  );

  // Garante sempre 6 cards (preenche com null se necessário)
  const outfitsToShow = [...savedOutfits];
  while (outfitsToShow.length < 6) {
    outfitsToShow.push(null);
  }

  // Agrupa em pares (2 por linha)
  const groupedOutfits = [];
  for (let i = 0; i < outfitsToShow.length; i += 2) {
    groupedOutfits.push(outfitsToShow.slice(i, i + 2));
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* SEÇÃO ROXA - Perfil */}
        <View style={styles.purpleSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={openMenu} style={styles.iconButton}>
              <FontAwesomeIcon icon={faGear} size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Card do Perfil */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesomeIcon icon={faUser} size={50} color="#999" />
              </View>
            </View>

            <Text style={styles.name}>{nomeUsuario}</Text>
            <Text style={styles.email}>{auth.currentUser?.email || '—'}</Text>
            <Text style={styles.outfitsText}>
              {loading ? '— Outfits' : `${savedOutfits.length} Outfits`}
            </Text>
            <View style={styles.tabIndicator} />
          </View>
        </View>

        {/* SEÇÃO CINZA - Grid de Outfits */}
        <View style={styles.graySection}>
          <View style={styles.gridContainer}>
            {groupedOutfits.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((item, colIndex) => {
                  const globalIndex = rowIndex * 2 + colIndex;
                  return renderOutfitCard(item, globalIndex);
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Menu Modal */}
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

          <TouchableOpacity style={styles.menuItem} onPress={handleEditarEstilos}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8', // Fundo geral cinza
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  
  // SEÇÃO ROXA
  purpleSection: {
    backgroundColor: '#9B8FD4',
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 40,
    marginTop: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileCard: {
    backgroundColor: '#F5F5F0',
    marginHorizontal: 24,
    borderRadius: 24,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarContainer: {
    marginTop: -50,
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D3CEC4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#F5F5F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  name: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    letterSpacing: -1,
  },
  email: {
    fontSize: 17,
    color: '#999',
    marginBottom: 24,
  },
  outfitsText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  tabIndicator: {
    width: 150,
    height: 4,
    backgroundColor: '#7B6FC8',
    borderRadius: 2,
  },

  // SEÇÃO CINZA
  graySection: {
    flex: 1,
    backgroundColor: '#E8E8E8',
    paddingTop: 24,
    paddingBottom: 80,
  },
  gridContainer: {
    paddingHorizontal: 24,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outfitCard: {
    width: '48%',
    aspectRatio: 0.75,
    backgroundColor: '#F5F5F0',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },

  // Modal Menu
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
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
    backgroundColor: '#9B8FD4',
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