import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function AdminAsistencia() {
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      try {
        const res = await fetch(`${API_URL}/api/admin/asistencias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setAsistencias(await res.json());
      } catch (e) {
        console.log(e);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const formatearDia = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { weekday: "long" });
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Asistencias</Text>
      </View>

      {asistencias.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="calendar-outline" size={40} color="#555" />
          <Text style={styles.textoVacio}>No hay asistencias registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={asistencias}
          keyExtractor={(item) => String(item.id_asistencia)}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <View style={styles.iconoBox}>
                <Ionicons name="calendar" size={20} color={VERDE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.textoAsistencia}>
                  El {formatearDia(item.fecha_hora_entrada)}, <Text style={styles.nombreDestacado}>{item.nombres} {item.apellidos}</Text> fue al gym.
                </Text>
                <Text style={styles.hora}>
                  {new Date(item.fecha_hora_entrada).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  titulo: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  vacio: { backgroundColor: TARJETA, margin: 20, borderRadius: 15, padding: 30, alignItems: "center" },
  textoVacio: { color: "#888", marginTop: 10, fontSize: 13 },
  tarjeta: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#222", gap: 12 },
  iconoBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  textoAsistencia: { color: "#DDD", fontSize: 14, lineHeight: 20, textTransform: "capitalize" },
  nombreDestacado: { color: VERDE, fontWeight: "900" },
  hora: { color: "#666", fontSize: 12, marginTop: 4 }
});