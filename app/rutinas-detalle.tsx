import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";
import { EJERCICIOS_DATA } from "../data/ejerciciosdata";
import { RUTINAS_DATA } from "../data/rutinasData";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function DetalleRutinaScreen() {
  const { id_rutina } = useLocalSearchParams<{ id_rutina: string }>();
  
  // Buscamos la rutina por su ID
  const rutina = RUTINAS_DATA.find((r) => r.id === Number(id_rutina));
  
  if (!rutina) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={{ color: "#FFF" }}>Rutina no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: VERDE }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Obtener los ejercicios de esa rutina
  const ejerciciosRutina = (rutina as any).ejerciciosIds.map((id: number) => 
    EJERCICIOS_DATA.find((e) => e.id === id)
  ).filter(Boolean);

  const completarRutina = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/completar-rutina`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre_rutina: rutina.nombre })
      });
      if (res.ok) {
        Alert.alert("¡Felicidades!", `Has completado la rutina: ${rutina.nombre}`, [
          { text: "Volver", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", "No se pudo guardar el progreso.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión.");
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver a rutinas</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>{rutina.nombre}</Text>
        <Text style={styles.detalles}>{rutina.duracion} · {rutina.dificultad}</Text>

        <Text style={styles.subtitulo}>EJERCICIOS A REALIZAR</Text>

        {ejerciciosRutina.map((ej: any, index: number) => (
          <View key={ej.id} style={styles.tarjeta}>
            <Image source={{ uri: ej.imagen }} style={styles.imagenEjercicio} />
            <View style={styles.infoEjercicio}>
              <View style={styles.numeroContainer}>
                <Text style={styles.numeroTexto}>{index + 1}</Text>
              </View>
              <Text style={styles.nombreEjercicio}>{ej.nombre}</Text>
              <Text style={styles.grupo}>{ej.grupo} · {ej.nivel}</Text>
              <Text style={styles.descripcion}>{ej.descripcion}</Text>
            </View>
          </View>
        ))}

        {/* BOTÓN DE COMPLETAR AL FINAL */}
        <TouchableOpacity style={styles.botonCompletar} onPress={completarRutina}>
          <Ionicons name="checkmark-circle" size={22} color="#000" />
          <Text style={styles.textoBotonCompletar}>MARCAR COMO COMPLETADA</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  contenido: { padding: 20, paddingBottom: 40 },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  volver: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 5 },
  detalles: { color: "#A5A5A5", fontSize: 13, marginBottom: 25 },
  subtitulo: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  
  tarjeta: { flexDirection: "row", backgroundColor: TARJETA, padding: 12, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: "#222", gap: 12 },
  imagenEjercicio: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#1A1A1A" },
  infoEjercicio: { flex: 1, justifyContent: "center" },
  numeroContainer: { position: "absolute", top: 0, right: 0, backgroundColor: "#1A1A1A", width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  numeroTexto: { color: VERDE, fontSize: 12, fontWeight: "bold" },
  nombreEjercicio: { color: "#FFF", fontSize: 16, fontWeight: "bold", paddingRight: 20 },
  grupo: { color: VERDE, fontSize: 11, fontWeight: "bold", marginTop: 4 },
  descripcion: { color: "#777", fontSize: 12, marginTop: 6, lineHeight: 18 },
  
  botonCompletar: { backgroundColor: VERDE, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 12, marginTop: 20, gap: 8 },
  textoBotonCompletar: { color: "#000", fontSize: 14, fontWeight: "900", textTransform: "uppercase" }
});