import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function MisRutinasEntrenador() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const res = await fetch(`${API_URL}/api/entrenador/rutinas`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRutinas(await res.json());
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = (id_rutina: number, nombre: string) => {
    Alert.alert(
      "Eliminar rutina",
      `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar", style: "destructive",
          onPress: async () => {
            const token = await SecureStore.getItemAsync("access_token");
            const res = await fetch(`${API_URL}/api/entrenador/rutinas/${id_rutina}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              Alert.alert("¡Eliminada!", "La rutina fue eliminada.");
              cargar();
            } else {
              Alert.alert("Error", "No se pudo eliminar la rutina.");
            }
          }
        }
      ]
    );
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Mis Rutinas</Text>
        <Text style={styles.subtitulo}>Rutinas que has creado</Text>

        {rutinas.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="barbell-outline" size={40} color="#555" />
            <Text style={styles.textoVacio}>Aún no has creado rutinas.</Text>
          </View>
        ) : (
          rutinas.map((rutina) => (
            <View key={rutina.id_rutina} style={styles.tarjeta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreRutina}>{rutina.nombre}</Text>
                <Text style={styles.descRutina}>{rutina.descripcion}</Text>
                <Text style={styles.nivelRutina}>{rutina.nivel.toUpperCase()}</Text>
              </View>
              <TouchableOpacity style={styles.botonEliminar} onPress={() => eliminar(rutina.id_rutina, rutina.nombre)}>
                <Ionicons name="trash-outline" size={22} color="#FF4F1F" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  contenido: { padding: 20 },
  volver: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  subtitulo: { color: "#666", fontSize: 13, marginTop: 5, marginBottom: 20 },
  vacio: { backgroundColor: TARJETA, borderRadius: 15, padding: 30, alignItems: "center" },
  textoVacio: { color: "#888", marginTop: 10, fontSize: 13 },
  tarjeta: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#222" },
  nombreRutina: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  descRutina: { color: "#888", fontSize: 12, marginTop: 4 },
  nivelRutina: { color: VERDE, fontSize: 10, marginTop: 6, fontWeight: "bold" },
  botonEliminar: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginLeft: 10 }
});