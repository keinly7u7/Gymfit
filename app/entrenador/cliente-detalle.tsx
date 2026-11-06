import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function ClienteDetalle() {
  const { id_cliente } = useLocalSearchParams<{ id_cliente: string }>();
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      try {
        const res = await fetch(`${API_URL}/api/entrenador/cliente/${id_cliente}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setData(await res.json());
      } catch (e) { console.log(e); }
      finally { setCargando(false); }
    }
    cargar();
  }, [id_cliente]);

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { weekday: 'long', day: 'numeric', month: 'short' });
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.tarjetaPerfil}>
          <Ionicons name="person-circle-outline" size={70} color={VERDE} style={{ alignSelf: "center", marginBottom: 15 }} />
          <Text style={styles.nombre}>{data?.cliente.nombres} {data?.cliente.apellidos}</Text>
          <Text style={styles.info}>{data?.cliente.correo}</Text>
          <Text style={styles.info}>{data?.cliente.telefono}</Text>
          <Text style={styles.info}>Nivel: {data?.cliente.nivel_experiencia}</Text>
        </View>

        <Text style={styles.tituloSeccion}>PROGRESO</Text>
        <View style={styles.gridEstadisticas}>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="checkmark-done-outline" size={24} color={VERDE} />
            <Text style={styles.valorEstadistica}>{data?.rutinas_completadas || 0}</Text>
            <Text style={styles.labelEstadistica}>Rutinas completadas</Text>
          </View>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="calendar-outline" size={24} color="#4FC3F7" />
            <Text style={styles.valorEstadistica}>{data?.asistencias || 0}</Text>
            <Text style={styles.labelEstadistica}>Asistencias</Text>
          </View>
        </View>

        <Text style={styles.tituloSeccion}>HISTORIAL DE RUTINAS</Text>
        {data?.historial.length === 0 ? (
          <Text style={styles.vacio}>Aún no ha completado rutinas.</Text>
        ) : (
          data?.historial.map((h: any, i: number) => (
            <View key={i} style={styles.cardHistorial}>
              <Ionicons name="checkmark-circle" size={20} color={VERDE} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreRutina}>{h.nombre_rutina}</Text>
                <Text style={styles.fechaRutina}>{formatearFecha(h.fecha_completada)}</Text>
              </View>
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
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  volver: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  tarjetaPerfil: { backgroundColor: TARJETA, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 20, alignItems: "center" },
  nombre: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  info: { color: "#888", fontSize: 13, marginTop: 4 },
  tituloSeccion: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  gridEstadisticas: { flexDirection: "row", gap: 10, marginBottom: 20 },
  tarjetaEstadistica: { flex: 1, backgroundColor: TARJETA, borderRadius: 15, padding: 15, alignItems: "center", gap: 5 },
  valorEstadistica: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 5 },
  labelEstadistica: { color: "#666", fontSize: 10, marginTop: 2, fontWeight: "600" },
  vacio: { color: "#444", fontSize: 13, marginBottom: 20 },
  cardHistorial: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 12, marginBottom: 8, gap: 12 },
  nombreRutina: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  fechaRutina: { color: VERDE, fontSize: 12, marginTop: 4, textTransform: "capitalize" },
});