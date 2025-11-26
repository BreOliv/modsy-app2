import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Dimensions,
   ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

const ModsyHelp = ({ isOpen, onClose }) => {
  // ✅ CORRETO: useFonts DENTRO do componente
  const [fontsLoaded] = useFonts({
    'CreatoDisplay': require('../fonts/CreatoDisplay-Medium.otf'),
  });

  const [loading, setLoading] = useState(false);

  const handleSectionLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  // Se as fontes não carregaram, pode mostrar um loading ou null
  if (!fontsLoaded) {
    return null;
  }

  // Se não estiver aberto, não renderiza nada
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
      <ImageBackground
          source={require('../img/Manual.png')} 
          style={styles.container}
          resizeMode="cover"
        >         
         {/* Botão de fechar */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <Image
            source={require('../img/bola3.png')}
            style={styles.backgroundImage3}
            resizeMode="cover"
          />
          <Image
            source={require('../img/bola4.png')}
            style={styles.backgroundImage4}
            resizeMode="cover"
          />

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Manual de uso do{'\n'}App Modsy</Text>
              <Text style={styles.subtitle}>
                Seu guarda-roupa digital acessível, feito para{'\n'}todos se vestirem com autonomia e estilo.
              </Text>
            </View>

            {/* Loading indicator */}
            {loading && (
              <View style={styles.loadingContainer} accessibilityLiveRegion="polite" accessibilityLabel="Carregando">
                <View style={styles.loadingDot}></View>
              </View>
            )}

            {/* Content Sections */}
            <View style={styles.sectionsContainer}>
              
              {/* Seção 1 - Cadastrar Roupas */}
              <TouchableOpacity 
                style={styles.section}
                onPress={handleSectionLoad}
                accessibilityRole="button"
                accessibilityLabel="Primeiros passos cadastre suas roupas"
                activeOpacity={0.8}
              >
                <View style={styles.sectionContent}>
                  <View style={styles.iconContainerNumber}>
                    <Text style={styles.numberText}>1</Text>
                  </View>
                  <View style={styles.sectionText}>
                    <Text style={styles.sectionTitle}>Primeiros Passos: Cadastre suas Roupas</Text>
                    <Text style={styles.descriptionText}>
                      • Toque no ícone "+"
                      {'\n'}• Tire uma foto da peça (de frente, fundo claro)
                      {'\n'}• Escolha: <Text style={styles.boldText}>Tipo</Text> (parte de cima, baixo, sapato...), <Text style={styles.boldText}>Cor</Text>, <Text style={styles.boldText}>Tecido</Text>, <Text style={styles.boldText}>Estilo</Text> (casual, elegante, rock, etc.)
                      {'\n'}• Toque em <Text style={styles.boldText}>Salvar</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Seção 5 - Dica: Como Tirar a Melhor Foto */}
        <TouchableOpacity 
          style={styles.section}
          onPress={handleSectionLoad}
          accessibilityRole="button"
          accessibilityLabel="Dica como tirar a melhor foto da peça"
          activeOpacity={0.8}
        >
        <View style={styles.sectionContent}>
          <View style={styles.iconContainerNumber}>
            <Text style={styles.numberText}>2</Text>
          </View>
          <View style={styles.sectionText}>
            <Text style={styles.sectionTitle}>Dica: Como Tirar a Melhor Foto</Text>
            <Text style={styles.descriptionText}>
              • Use <Text style={styles.boldText}>fundo neutro</Text> (parede branca ou lençol claro)
              {'\n'}• Deixe a peça <Text style={styles.boldText}>esticada</Text> (em cabide ou deitada, sem amassar)
              {'\n'}• Fotografe com <Text style={styles.boldText}>luz natural</Text> (perto de janela, sem flash)
              {'\n'}• Mantenha a peça <Text style={styles.boldText}>centralizada e de frente</Text>, ocupando 80% da imagem
              {'\n'}• <Text style={styles.boldText}>Não use plástico, saquinhos nem filtros</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>

              {/* Seção 2 - Escolher Look */}
              <TouchableOpacity 
                style={styles.section}
                onPress={handleSectionLoad}
                accessibilityRole="button"
                accessibilityLabel="Escolha seu look"
                activeOpacity={0.8}
              >
                <View style={styles.sectionContent}>
                  <View style={styles.iconContainerNumber}>
                    <Text style={styles.numberText}>3</Text>
                  </View>
                  <View style={styles.sectionText}>
                    <Text style={styles.sectionTitle}>Escolha seu Look</Text>
                    <Text style={styles.descriptionText}>
                      • Vá em <Text style={styles.boldText}>"Combinações"</Text>
                      {'\n'}• Combine peças sugeridas e <Text style={styles.boldText}>Gere Novos Look</Text>
                      {'\n'}• Veja peças sugerida para a ocasião sugerida pela Inteligência Artificial
                      {'\n'}• Toque em no botão "Salvar" <Text style={styles.boldText}>Favoritar</Text> para salvar
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Seção 3 - Personalizar */}
              <TouchableOpacity 
                style={styles.section}
                onPress={handleSectionLoad}
                accessibilityRole="button"
                accessibilityLabel="Personalize seus gostos"
                activeOpacity={0.8}
              >
                <View style={styles.sectionContent}>
                  <View style={styles.iconContainerNumber}>
                    <Text style={styles.numberText}>4</Text>
                  </View>
                  <View style={styles.sectionText}>
                    <Text style={styles.sectionTitle}>Personalize seus Gostos</Text>
                    <Text style={styles.descriptionText}>
                      Em <Text style={styles.boldText}>"Perfil" → Ícone "Engrenagem" → "Meus Gostos"</Text>, escolha:
                      {'\n'}• <Text style={styles.boldText}>Estilos:</Text> elegante, casual, rock, esportivo, vintage, minimalista...
                      {'\n'}• <Text style={styles.boldText}>Ocasiões:</Text> trabalho, festa, dia a dia, academia...
                      {'\n\n'}<Text style={styles.noteText}>O app usará essas preferências para sugerir combinações melhores.</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Seção 4 - Acessibilidade */}
              <TouchableOpacity 
                style={styles.section}
                onPress={handleSectionLoad}
                accessibilityRole="button"
                accessibilityLabel="Acessibilidade para todos"
                activeOpacity={0.8}
              >
                <View style={styles.sectionContent}>
                  <View style={styles.iconContainerNumber}>
                    <Text style={styles.numberText}>5</Text>
                  </View>
                  <View style={styles.sectionText}>
                    <Text style={styles.sectionTitle}>Acessibilidade para Todos</Text>
                    <Text style={styles.descriptionText}>
                      • Botões grandes e espaçados
                      {'\n'}• Contraste alto e fonte clara
                      {'\n'}• Descrições completas em texto
                      {'\n'}• Compatível com leitores de tela (VoiceOver, TalkBack)
                      {'\n'}• Navegação linear e previsível
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Brand Footer */}
              <View style={styles.brandFooter}>
                <Text style={styles.brandText}>
                  <Text style={styles.boldText}>Modsy:</Text> Moda que te entende. Tecnologia que te liberta.
                </Text>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', 
  },
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1000,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 20,
  },
  closeIcon: {
    fontSize: 20,
    color: '#000000', 
    fontWeight: 'bold',
  },
  backgroundImage3: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height * 0.5,
    opacity: 0.1, 
  },
  backgroundImage4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width,
    height: height * 0.5,
    opacity: 0.1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000', 
    marginBottom: 12,
    lineHeight: 40,
    fontFamily: 'CreatoDisplay',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563', 
    lineHeight: 20,
    fontFamily: 'CreatoDisplay',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingDot: {
    width: 12,
    height: 12,
    backgroundColor: '#6B7280', 
    borderRadius: 6,
  },
  sectionsContainer: {
    paddingHorizontal: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.17)', 
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainerNumber: {
    backgroundColor: '#a89cf2', 
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  numberText: {
    color: '#000000', 
    fontWeight: 'bold',
    fontSize: 22,
    fontFamily: 'CreatoDisplay',
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    color: '#000000', 
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 12,
    lineHeight: 24,
    fontFamily: 'CreatoDisplay',
  },
  descriptionText: {
    color: '#374151', 
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'CreatoDisplay',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000000', 
    fontFamily: 'CreatoDisplay',
  },
  noteText: {
    fontSize: 12,
    color: '#6B7280', 
    fontFamily: 'CreatoDisplay',
  },
  brandFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  brandText: {
    color: '#4B5563', 
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'CreatoDisplay',
  },
});
export default ModsyHelp;