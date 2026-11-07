import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function RutinasPersonalizadas() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarRutinas = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const res = await fetch(`${API_URL}/api/mis-rutinas`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setRutinas(data.filter((r: any) => r.es_general === 0));
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarRutinas();
  }, []);

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={VERDE} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Mis Rutinas Personalizadas</Text>
        </View>

        {cargando ? (
          <ActivityIndicator color={VERDE} size="large" style={{ marginTop: 50 }} />
        ) : rutinas.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="fitness-outline" size={40} color="#555" />
            <Text style={styles.textoVacio}>Tu entrenador aún no te ha asignado una rutina.</Text>
          </View>
        ) : (
          rutinas.map((rutina) => (
            <View key={rutina.id_rutina} style={styles.tarjeta}>
              <View style={styles.filaEntre}>
                <Text style={styles.nombreRutina}>{rutina.nombre}</Text>
                <Text style={styles.objetivo}>{rutina.nivel.toUpperCase()}</Text>
              </View>
              <Text style={styles.descripcion}>{rutina.descripcion}</Text>

              <TouchableOpacity
                style={styles.botonVer}
                onPress={() =>
                  router.push({
                    pathname: "/rutinas-detalle-personalizada",
                    params: { id_rutina: rutina.id_rutina },
                  } as any)
                }
              >
                <Text style={styles.textoBoton}>Ver ejercicios</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
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
  contenido: { padding: 20 },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 25 },
  titulo: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  vacio: { alignItems: "center", backgroundColor: TARJETA, borderRadius: 15, padding: 30, marginTop: 20 },
  textoVacio: { color: "#A5A5A5", marginTop: 15, textAlign: "center" },
  tarjeta: { backgroundColor: TARJETA, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#222" },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  nombreRutina: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  objetivo: { color: VERDE, fontSize: 10, fontWeight: "900" },
  descripcion: { color: "#888", fontSize: 13, marginBottom: 15 },
  botonVer: { backgroundColor: VERDE, padding: 12, borderRadius: 10, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  textoBoton: { color: "#000", fontWeight: "900", fontSize: 12 },
});