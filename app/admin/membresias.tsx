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

export default function AdminMembresias() {
  const [membresias, setMembresias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      try {
        const res = await fetch(`${API_URL}/api/admin/membresias`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setMembresias(await res.json());
      } catch (e) {
        console.log(e);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No disponible";
    const partes = fecha.slice(0, 10).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Membresías</Text>
      </View>

      {membresias.length === 0 ? (
        <View style={styles.vacio}>
          <Ionicons name="card-outline" size={40} color="#555" />
          <Text style={styles.textoVacio}>No hay membresías registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={membresias}
          keyExtractor={(item) => String(item.id_membresia)}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <View style={styles.iconoBox}>
                <Ionicons name="card" size={20} color={VERDE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cliente}>{item.cliente}</Text>
                <Text style={styles.plan}>{item.plan}</Text>
                <Text style={styles.fecha}>
                  {formatearFecha(item.fecha_inicio)} - {formatearFecha(item.fecha_fin)}
                </Text>
              </View>
              <View style={[styles.estadoBadge, item.estado_calculado === "vencida" && styles.estadoVencida]}>
                <Text style={[styles.estadoTexto, item.estado_calculado === "vencida" && styles.estadoTextoVencida]}>
                  {item.estado_calculado?.toUpperCase()}
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
  cliente: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  plan: { color: VERDE, fontSize: 12, marginTop: 2 },
  fecha: { color: "#888", fontSize: 11, marginTop: 4 },
  estadoBadge: { backgroundColor: `${VERDE}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  estadoVencida: { backgroundColor: "#FF4F1F20" },
  estadoTexto: { color: VERDE, fontSize: 9, fontWeight: "900" },
  estadoTextoVencida: { color: "#FF4F1F" }
});