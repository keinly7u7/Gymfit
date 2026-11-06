import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MisLogros() {
  return (
    <SafeAreaView style={styles.contenedor}>
      <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#CFFF00" />
        <Text style={styles.textoVolver}>Volver</Text>
      </TouchableOpacity>
      <View style={styles.centro}>
        <Ionicons name="medal-outline" size={70} color="#CFFF00" />
        <Text style={styles.titulo}>Mis Logros</Text>
        <Text style={styles.texto}>Tus medallas aparecerán aquí. Completa rutinas y asiste al gimnasio para desbloquear reconocimientos.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#080808", padding: 20 },
  volver: { flexDirection: "row", alignItems: "center", gap: 8 },
  textoVolver: { color: "#CFFF00", fontSize: 16, fontWeight: "bold" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 15 },
  titulo: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  texto: { color: "#A5A5A5", textAlign: "center", fontSize: 14, lineHeight: 22, paddingHorizontal: 20 },
});