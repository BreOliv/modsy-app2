import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { auth } from "../firebaseConfig";
import {
  salvarPeca,
  carregarPecas,
  excluirPeca,
} from "../services/authService";
import { useNavigation } from "@react-navigation/native";

const REMOVE_BG_API_KEY = "qso1cW5r34EmSwKZeV5rzJtr";

export default function GuardaRoupa({}) {
  const navigation = useNavigation();
  const [pecas, setPecas] = useState({
    superior: [],
    inferior: [],
    unica: [],
    sapato: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [imagemUri, setImagemUri] = useState(null);
  const [tipo, setTipo] = useState("superior");
  const [tipoEspecifico, setTipoEspecifico] = useState("");
  const [cor, setCor] = useState("");
  const [estilo, setEstilo] = useState("");
  const [tecido, setTecido] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      carregarPecas(uid)
        .then((dados) => setPecas(dados))
        .catch((err) => {
          console.error("Erro ao carregar peças:", err);
          Alert.alert("Erro", "Não foi possível carregar seu guarda-roupa.");
        });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted" || cameraStatus.status !== "granted") {
          Alert.alert(
            "Permissões necessárias",
            "Precisamos de acesso à câmera e galeria."
          );
        }
      }
    })();
  }, []);

  const handleAdicionarPeca = () => {
    setImagemUri(null);
    setTipo("superior");
    setTipoEspecifico("");
    setCor("");
    setEstilo("");
    setTecido("");
    setModalVisible(true);
  };

const removeBackground = async (localUri) => {
  if (!REMOVE_BG_API_KEY) {
    Alert.alert("Erro", "Chave da API do Remove.bg não configurada.");
    return localUri;
  }

  setRemovingBg(true);
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: "base64",
    });

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": REMOVE_BG_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        image_file_b64: base64,
        size: "auto",
      }),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Resposta não é JSON:", text);
      Alert.alert("Erro", "A API não respondeu com JSON. Verifique sua chave.");
      return localUri;
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.errors?.[0]?.title || "Erro desconhecido";
      console.error("Erro da API remove.bg:", errorMsg);
      Alert.alert("Erro", `Falha ao remover fundo: ${errorMsg}`);
      return localUri;
    }

    const resultJson = await response.json();
    const base64SemFundo = resultJson.data?.result_b64;

    if (!base64SemFundo) {
      Alert.alert("Erro", "Resposta inválida da API: base64 ausente.");
      return localUri;
    }

    const fileUri = `${FileSystem.cacheDirectory}sem_fundo_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(fileUri, base64SemFundo, {
      encoding: "base64",
    });

    return fileUri;
  } catch (error) {
    console.error("Erro ao remover fundo:", error);
    Alert.alert("Erro", "Não foi possível processar a imagem.");
    return localUri;
  } finally {
    setRemovingBg(false);
  }
};

  const selecionarImagem = async (origem) => {
    let result;

    try {
      if (origem === "camera") {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          allowsEditing: true,
          aspect: [1, 1.5],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1.5],
          quality: 0.8,
        });
      }
    } catch (error) {
      console.error("Erro ao abrir seletor:", error);
      Alert.alert(
        "Erro",
        "Falha ao acessar câmera/galeria. Verifique as permissões."
      );
      return;
    }

    if (result.canceled || !result.assets || result.assets.length === 0) {
      console.log("Seleção cancelada ou vazia");
      return;
    }

    const uri = result.assets[0].uri;
    console.log("Imagem selecionada:", uri);

    Alert.alert(
      "Processar imagem?",
      "Deseja remover automaticamente o fundo da peça?",
      [
        { text: "Manter original", onPress: () => setImagemUri(uri) },
        {
          text: "Remover fundo",
          onPress: async () => {
            const novaImagem = await removeBackground(uri);
            setImagemUri(novaImagem);
          },
        },
      ]
    );
  };

  const salvarPecaLocal = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Erro", "Você não está logado.");
      return;
    }

    if (!imagemUri) {
      Alert.alert("Erro", "Selecione uma imagem.");
      return;
    }

    if (
      !tipoEspecifico.trim() ||
      !cor.trim() ||
      !estilo.trim() ||
      !tecido.trim()
    ) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const peca = {
        categoria: tipo,
        tipo: tipoEspecifico.trim(),
        cor: cor.trim(),
        estilo: estilo.trim(),
        tecido: tecido.trim(),
        imageUrl: imagemUri,
      };

      await salvarPeca(uid, peca);

      setPecas((prev) => ({
        ...prev,
        [tipo]: [
          ...prev[tipo],
          { ...peca, id: Date.now().toString(), uri: imagemUri },
        ],
      }));

      setModalVisible(false);
      Alert.alert("Sucesso", "Peça adicionada ao seu guarda-roupa!");
    } catch (error) {
      console.error("Erro ao salvar peça:", error);
      Alert.alert("Erro", "Não foi possível salvar a peça. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirPeca = (pecaId, categoria) => {
    Alert.alert(
      "Excluir peça?",
      "Tem certeza que deseja remover esta peça do seu guarda-roupa?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await excluirPeca(pecaId);
              setPecas((prev) => ({
                ...prev,
                [categoria]: prev[categoria].filter(
                  (peca) => peca.id !== pecaId
                ),
              }));
              Alert.alert("Sucesso", "Peça removida!");
            } catch (error) {
              console.error("Erro ao excluir peça:", error);
              Alert.alert("Erro", "Não foi possível excluir a peça.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👗 Meu Guarda-Roupa</Text>
      <Text style={styles.welcome}>Olá, {auth.currentUser?.email}!</Text>

      <Button
        title="✨ Sugerir Look com IA"
        onPress={() => Alert.alert("IA", "Em desenvolvimento!")}
      />
      <Button
        title="+ Adicionar Peça"
        onPress={handleAdicionarPeca}
        color="#666"
      />
      <Button
        title="Meu Perfil"
        onPress={() => navigation.navigate("Perfil")}
      />

      <View style={styles.roupasSection}>
        <Text style={styles.sectionTitle}>Superiores</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pecas.superior.map((peca) => (
            <TouchableOpacity
              key={peca.id}
              onPress={() => handleExcluirPeca(peca.id, "superior")}
              style={styles.pecaItem}
              activeOpacity={0.8}
            >
              <Image source={{ uri: peca.uri }} style={styles.pecaImage} />
              <Text style={styles.pecaLabel}>{peca.tipo}</Text>
              <Text style={styles.pecaSubLabel}>{peca.cor}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Inferiores</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pecas.inferior.map((peca) => (
            <TouchableOpacity
              key={peca.id}
              onPress={() => handleExcluirPeca(peca.id, "inferior")}
              style={styles.pecaItem}
              activeOpacity={0.8}
            >
              <Image source={{ uri: peca.uri }} style={styles.pecaImage} />
              <Text style={styles.pecaLabel}>{peca.tipo}</Text>
              <Text style={styles.pecaSubLabel}>{peca.cor}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Peças Únicas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pecas.unica.map((peca) => (
            <TouchableOpacity
              key={peca.id}
              onPress={() => handleExcluirPeca(peca.id, "unica")}
              style={styles.pecaItem}
              activeOpacity={0.8}
            >
              <Image source={{ uri: peca.uri }} style={styles.pecaImage} />
              <Text style={styles.pecaLabel}>{peca.tipo}</Text>
              <Text style={styles.pecaSubLabel}>{peca.cor}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Sapatos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pecas.sapato.map((peca) => (
            <TouchableOpacity
              key={peca.id}
              onPress={() => handleExcluirPeca(peca.id, "sapato")}
              style={styles.pecaItem}
              activeOpacity={0.8}
            >
              <Image source={{ uri: peca.uri }} style={styles.pecaImage} />
              <Text style={styles.pecaLabel}>{peca.tipo}</Text>
              <Text style={styles.pecaSubLabel}>{peca.cor}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Adicionar Nova Peça</Text>

          {removingBg ? (
            <View
              style={[
                styles.previewImage,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size="large" color="#000" />
              <Text style={{ marginTop: 10, color: "#666" }}>
                Removendo fundo...
              </Text>
            </View>
          ) : imagemUri ? (
            <Image source={{ uri: imagemUri }} style={styles.previewImage} />
          ) : (
            <View style={[styles.previewImage, { backgroundColor: "#eee" }]} />
          )}

          <View style={styles.buttonRow}>
            <Button
              title="📸 Câmera"
              onPress={() => selecionarImagem("camera")}
            />
            <Button
              title="🖼️ Galeria"
              onPress={() => selecionarImagem("galeria")}
            />
          </View>

          <Text style={styles.label}>Categoria:</Text>
          <View style={styles.tipoButtons}>
            {["superior", "inferior", "unica", "sapato"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTipo(t)}
                style={[
                  styles.tipoButton,
                  tipo === t && styles.tipoButtonSelected,
                ]}
              >
                <Text
                  style={tipo === t ? styles.tipoTextSelected : styles.tipoText}
                >
                  {t === "unica"
                    ? "Peça única"
                    : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Tipo (ex: vestido, camisa)"
            value={tipoEspecifico}
            onChangeText={setTipoEspecifico}
          />
          <TextInput
            style={styles.input}
            placeholder="Cor (ex: azul, preto)"
            value={cor}
            onChangeText={setCor}
          />
          <TextInput
            style={styles.input}
            placeholder="Estilo (ex: casual, elegante)"
            value={estilo}
            onChangeText={setEstilo}
          />
          <TextInput
            style={styles.input}
            placeholder="Tecido (ex: algodão, jeans)"
            value={tecido}
            onChangeText={setTecido}
          />

          <Button
            title="✅ Salvar Peça"
            onPress={salvarPecaLocal}
            color="#4CAF50"
            disabled={loading || removingBg}
          />

          <Button
            title="⬅️ Cancelar"
            onPress={() => setModalVisible(false)}
            color="#999"
            style={{ marginTop: 20 }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  welcome: { textAlign: "center", marginVertical: 10, color: "#555" },
  roupasSection: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  pecaItem: { alignItems: "center", marginRight: 15, width: 80 },
  pecaImage: {
    width: 70,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pecaLabel: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 4,
  },
  pecaSubLabel: { fontSize: 10, color: "#666", textAlign: "center" },
  modalContainer: { flex: 1, padding: 20, backgroundColor: "#fff" },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  tipoButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tipoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
  },
  tipoButtonSelected: { backgroundColor: "#000", borderColor: "#000" },
  tipoText: { color: "#000" },
  tipoTextSelected: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
});
