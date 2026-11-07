import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function EjercicioDetalle() {
  // VOLVEMOS A RECIBIR LOS PARÁMETROS DINÁMICOS
  const { nombre, grupo, nivel, descripcion, imagen, maquina, instrucciones, mostrar_series } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        {/* Ahora la imagen viene de los parámetros */}
        <Image source={{ uri: imagen as string }} style={styles.image} />

        <Text style={styles.title}>{nombre}</Text>
        <Text style={styles.subtitle}>{grupo} · {nivel}</Text>

        {/* TARJETA DE SERIES (SOLO SI VIENE DE UNA RUTINA) */}
        {mostrar_series === "true" && (
          <View style={styles.seriesCard}>
            <Ionicons name="barbell-outline" size={24} color={VERDE} />
            <View style={styles.seriesInfo}>
              <Text style={styles.seriesTitle}>RUTINA A SEGUIR</Text>
              <Text style={styles.seriesText}>3 series x 10-12 repeticiones</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.text}>{descripcion}</Text>
        
        <Text style={styles.sectionTitle}>Máquina / Equipo</Text>
        <View style={styles.equipoRow}>
          <Ionicons name="construct-outline" size={18} color="#AAA" />
          <Text style={[styles.text, { marginLeft: 8 }]}>{maquina}</Text>
        </View>

        <Text style={styles.sectionTitle}>Instrucciones</Text>
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsText}>{instrucciones}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FONDO },
  content: { padding: 20 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20, marginTop: 10 },
  backText: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  image: { width: "100%", height: 220, borderRadius: 15, backgroundColor: "#1A1A1A" },
  title: { color: "#FFF", fontSize: 26, fontWeight: "900", marginTop: 15 },
  subtitle: { color: VERDE, fontSize: 14, fontWeight: "bold", marginBottom: 20 },
  seriesCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A220A", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#3A4A1A", marginBottom: 20, gap: 12 },
  seriesInfo: { flex: 1 },
  seriesTitle: { color: VERDE, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  seriesText: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginTop: 4 },
  sectionTitle: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 8 },
  text: { color: "#AAA", fontSize: 14, lineHeight: 22 },
  equipoRow: { flexDirection: "row", alignItems: "center" },
  instructionsBox: { backgroundColor: TARJETA, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#222" },
  instructionsText: { color: "#DDD", fontSize: 14, lineHeight: 24 },
});