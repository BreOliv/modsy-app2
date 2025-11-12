import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faGear, faUser, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useFonts } from 'expo-font';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('Carregando...');
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Modal de Look
  const [selectedLook, setSelectedLook] = useState(null);
  const [isLookModalVisible, setIsLookModalVisible] = useState(false);
  const lookModalScale = useRef(new Animated.Value(0.8)).current;
  const lookModalOpacity = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'StretchPro': require('../fonts/StretchPro.otf'),
  });

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

        const looksCollectionRef = collection(db, 'users', auth.currentUser.uid, 'looks');
        const looksSnapshot = await getDocs(looksCollectionRef);

        const savedOutfitsList = [];
        looksSnapshot.forEach((doc) => {
          const lookData = doc.data();
          if (lookData.pecas && Array.isArray(lookData.pecas) && lookData.pecas.length > 0) {
            const tipos = lookData.pecas.map(p => p.tipo).filter(Boolean).join(', ');
            const name = tipos ? `Look: ${tipos}` : 'Look salvo';
            savedOutfitsList.push({
              id: doc.id,
              name,
              pecas: lookData.pecas,
              estilo: lookData.estilo || 'Sem estilo definido',
            });
          }
        });

        setSavedOutfits(savedOutfitsList);
      } else {
        const fallbackName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Usuário';
        await setDoc(userDocRef, {
          nome: fallbackName,
          estilos: [],
          email: auth.currentUser.email || '',
          createdAt: new Date(),
        });
        setNomeUsuario(fallbackName);
        setSavedOutfits([]);
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar perfil: ' + (error.message || 'desconhecido'));
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

  // Abrir modal de look
  const openLookModal = (look) => {
    setSelectedLook(look);
    setIsLookModalVisible(true);
    Animated.parallel([
      Animated.spring(lookModalScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(lookModalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fechar modal de look
  const closeLookModal = () => {
    Animated.parallel([
      Animated.spring(lookModalScale, {
        toValue: 0.8,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(lookModalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLookModalVisible(false);
      setSelectedLook(null);
    });
  };

  // Excluir look
  const deleteLook = async (lookId) => {
    Alert.alert(
      'Excluir Look',
      'Tem certeza que deseja excluir este look?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const lookDocRef = doc(db, 'users', auth.currentUser.uid, 'looks', lookId);
              await deleteDoc(lookDocRef);
              setSavedOutfits(prev => prev.filter(outfit => outfit.id !== lookId));
              closeLookModal();
              Alert.alert('Sucesso', 'Look excluído com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o look: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const LookCard = ({ item }) => {
    const camisa = item.pecas.find(p => ['Camisa', 'Blusa', 'Top', 'Regata'].includes(p.tipo));
    const calca = item.pecas.find(p => ['Calça', 'Saia', 'Shorts'].includes(p.tipo));
    const sapato = item.pecas.find(p => ['Tênis', 'Sapato', 'Sandália'].includes(p.tipo));

    return (
      <TouchableOpacity
        style={styles.outfitCard}
        onPress={() => openLookModal(item)}
      >
        <View style={styles.lookContainer}>
          <View style={styles.mainColumn}>
            {camisa ? (
              <Image source={{ uri: camisa.imageUrl }} style={styles.mainPiece} resizeMode="contain" />
            ) : (
              <View style={[styles.placeholder, styles.mainPlaceholder]}>
                <Text style={styles.placeholderText}>Camisa</Text>
              </View>
            )}

            {calca ? (
              <Image source={{ uri: calca.imageUrl }} style={styles.bottomPiece} resizeMode="contain" />
            ) : (
              <View style={[styles.placeholder, styles.bottomPlaceholder]}>
                <Text style={styles.placeholderText}>Calça</Text>
              </View>
            )}
          </View>

          <View style={styles.shoeContainer}>
            {sapato ? (
              <Image source={{ uri: sapato.imageUrl }} style={styles.shoePiece} resizeMode="contain" />
            ) : (
              <View style={[styles.placeholder, styles.shoePlaceholder]}>
                <Text style={styles.placeholderText}>Sapato</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const outfitsToShow = [...savedOutfits];
  while (outfitsToShow.length < 6) {
    outfitsToShow.push(null);
  }

  const groupedOutfits = [];
  for (let i = 0; i < outfitsToShow.length; i += 2) {
    groupedOutfits.push(outfitsToShow.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openMenu} style={styles.iconButton}>
              <FontAwesomeIcon icon={faGear} size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <FontAwesomeIcon icon={faUser} size={35} color="#999" />
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

        <View style={styles.graySection}>
          <View style={styles.gridContainer}>
            {groupedOutfits.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map((item, colIndex) => {
                  const globalKey = `empty-${rowIndex}-${colIndex}`;
                  if (!item) {
                    return <View key={globalKey} style={[styles.outfitCard, styles.emptyCard]} />;
                  }
                  return <LookCard key={item.id} item={item} />;
                })}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal visible={isMenuVisible} transparent animationType="none" onRequestClose={closeMenu}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu} />
        <Animated.View style={[styles.menuContainer, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Configurações</Text>
          </View>
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); navigation.navigate('EditarPerfil'); }}>
            <View style={styles.menuIcon}><Text style={styles.iconText}>👤</Text></View>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditarEstilos}>
            <View style={styles.menuIcon}><Text style={styles.iconText}>🎨</Text></View>
            <Text style={styles.menuText}>Editar Gostos</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); Alert.alert('Gerenciamento de Conta', 'Em breve!'); }}>
            <View style={styles.menuIcon}><Text style={styles.iconText}>⚙️</Text></View>
            <Text style={styles.menuText}>Gerenciamento de Conta</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); Alert.alert('Ajuda', 'Entre em contato com nosso suporte.'); }}>
            <View style={styles.menuIcon}><Text style={styles.iconText}>❓</Text></View>
            <Text style={styles.menuText}>Ajuda</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: '#f44336' }]}>
              <Text style={{ fontSize: 18, color: '#fff' }}>🚪</Text>
            </View>
            <Text style={[styles.menuText, { color: '#f44336' }]}>Sair da Conta</Text>
            <Text style={[styles.arrow, { color: '#f44336' }]}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* Modal de Look Ampliado */}
      <Modal
        visible={isLookModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeLookModal}
      >
        <View style={styles.lookModalOverlay}>
          <TouchableOpacity
            style={styles.lookModalBackground}
            activeOpacity={1}
            onPress={closeLookModal}
          />
          {selectedLook && (
            <Animated.View
              style={[
                styles.lookModalContent,
                {
                  opacity: lookModalOpacity,
                  transform: [{ scale: lookModalScale }],
                },
              ]}
            >
              <TouchableOpacity style={styles.closeButton} onPress={closeLookModal}>
                <FontAwesomeIcon icon={faTimes} size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deleteLook(selectedLook.id)}
              >
                <FontAwesomeIcon icon={faTrash} size={20} color="#FFF" />
              </TouchableOpacity>

              <Text style={styles.modalLookTitle}>{selectedLook.estilo}</Text>

              <View style={styles.modalLookContainer}>
                <View style={styles.modalMainColumn}>
                  {selectedLook.pecas.find(p => ['Camisa', 'Blusa', 'Top', 'Regata'].includes(p.tipo)) ? (
                    <Image
                      source={{
                        uri: selectedLook.pecas.find(p => ['Camisa', 'Blusa', 'Top', 'Regata'].includes(p.tipo)).imageUrl,
                      }}
                      style={styles.modalMainPiece}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.placeholder, styles.modalMainPlaceholder]}>
                      <Text style={styles.placeholderText}>Camisa</Text>
                    </View>
                  )}

                  {selectedLook.pecas.find(p => ['Calça', 'Saia', 'Shorts'].includes(p.tipo)) ? (
                    <Image
                      source={{
                        uri: selectedLook.pecas.find(p => ['Calça', 'Saia', 'Shorts'].includes(p.tipo)).imageUrl,
                      }}
                      style={styles.modalBottomPiece}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={[styles.placeholder, styles.modalBottomPlaceholder]}>
                      <Text style={styles.placeholderText}>Calça</Text>
                    </View>
                  )}

                  <View style={styles.modalShoeContainer}>
                    {selectedLook.pecas.find(p => ['Tênis', 'Sapato', 'Sandália'].includes(p.tipo)) ? (
                      <Image
                        source={{
                          uri: selectedLook.pecas.find(p => ['Tênis', 'Sapato', 'Sandália'].includes(p.tipo)).imageUrl,
                        }}
                        style={styles.modalShoePiece}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.placeholder, styles.modalShoePlaceholder]}>
                        <Text style={styles.placeholderText}>Sapato</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  purpleSection: {
    backgroundColor: '#9B8FD4',
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 30,
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
    paddingBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  avatarContainer: {
    marginTop: -35,
    marginBottom: 8,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 42.5,
    backgroundColor: '#D3CEC4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F5F5F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1,
    letterSpacing: -0.5,
    fontFamily: 'StretchPro',
  },
  email: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  outfitsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  tabIndicator: {
    width: 100,
    height: 3,
    backgroundColor: '#7B6FC8',
    borderRadius: 2,
  },
  graySection: {
    backgroundColor: '#E8E8E8',
    paddingTop: 24,
    paddingBottom: 40,
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
    aspectRatio: 0.9,
    backgroundColor: '#F5F5F0',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  emptyCard: {
    backgroundColor: '#F5F5F0',
  },
  lookContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
  },
  mainColumn: {
    width: '65%',
    justifyContent: 'flex-start',
  },
  mainPiece: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
  },
  bottomPiece: {
    width: '100%',
    height: 70,
    borderRadius: 12,
  },
  shoeContainer: {
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoePiece: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F0',
  },
  mainPlaceholder: {
    width: '100%',
    height: 100,
    marginBottom: 6,
  },
  bottomPlaceholder: {
    width: '100%',
    height: 70,
  },
  shoePlaceholder: {
    width: 60,
    height: 60,
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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

  // Modal de Look
  lookModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookModalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(155, 143, 212, 0.95)',
  },
  lookModalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalLookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 10,
    fontFamily: 'StretchPro',
  },
  modalLookContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  modalMainColumn: {
    width: '100%',
    alignItems: 'center',
  },
  modalMainPiece: {
    width: '80%',
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalBottomPiece: {
    width: '80%',
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalShoeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalShoePiece: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  modalMainPlaceholder: {
    width: '80%',
    height: 160,
    marginBottom: 8,
  },
  modalBottomPlaceholder: {
    width: '80%',
    height: 160,
    marginBottom: 8,
  },
  modalShoePlaceholder: {
    width: 120,
    height: 120,
  },
});