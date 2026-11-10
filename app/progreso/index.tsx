import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function MiProgreso() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false); // Para el botón

  const cargarDatos = async () => {
    setCargando(true);
    const token = await SecureStore.getItemAsync("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resRut, resAsis] = await Promise.all([
        fetch(`${API_URL}/api/mis-rutinas-completadas`, { headers }),
        fetch(`${API_URL}/api/mis-asistencias`, { headers }),
      ]);

      const textoRut = await resRut.text();
      if (resRut.ok) {
        try {
          const json = JSON.parse(textoRut);
          const lista = Array.isArray(json) ? json : json.rutinas || json.data || [];
          setRutinas(lista);
        } catch (e) { setRutinas([]); }
      } else { setRutinas([]); }

      if (resAsis.ok) {
        try {
          const jsonAsis = await resAsis.json();
          setAsistencias(Array.isArray(jsonAsis) ? jsonAsis : jsonAsis.data ?? []);
        } catch { setAsistencias([]); }
      }
    } catch (e) {
      console.log("ERROR FATAL:", e);
    } finally {
      setCargando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  // --- FUNCIÓN PARA REGISTRAR ASISTENCIA ---
  const registrarAsistencia = async () => {
    if (registrando) return;
    setRegistrando(true);
    const token = await SecureStore.getItemAsync("access_token");

    try {
      const res = await fetch(`${API_URL}/api/registrar-mi-asistencia`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert("¡Éxito!", data.mensaje || "Asistencia registrada correctamente.");
        cargarDatos(); // Recarga la lista para que aparezca la nueva
      } else {
        Alert.alert("Aviso", data.detail || "No se pudo registrar la asistencia.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión con el servidor.");
    } finally {
      setRegistrando(false);
    }
  };

  const formatearFecha = (iso: string) => {
    if (!iso) return "Sin fecha";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Sin fecha";
    return d.toLocaleDateString("es-CO", {
      weekday: "long", day: "numeric", month: "short",
    });
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator color={VERDE} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={VERDE} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Mi Progreso</Text>
        </View>

        <Text style={styles.subtitulo}>RUTINAS COMPLETADAS ({rutinas.length})</Text>

        {rutinas.length === 0 ? (
          <Text style={styles.vacio}>Aún no has completado rutinas.</Text>
        ) : (
          rutinas.map((r: any, i: number) => (
            <View key={r.id_completada ?? `r-${i}`} style={styles.cardRutina}>
              <Ionicons name="checkmark-circle" size={22} color={VERDE} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreRutina}>{r.nombre_rutina ?? r.nombre ?? "Rutina"}</Text>
                <Text style={styles.fecha}>{formatearFecha(r.fecha_completada ?? r.fecha)}</Text>
              </View>
            </View>
          ))
        )}

        {/* SECCIÓN DE ASISTENCIAS CON BOTÓN */}
        <View style={styles.filaTituloAsistencia}>
          <Text style={styles.subtitulo}>ASISTENCIAS ({asistencias.length})</Text>
          <TouchableOpacity style={styles.botonAsistencia} onPress={registrarAsistencia} disabled={registrando}>
            {registrando ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle" size={16} color="#000" />
                <Text style={styles.textoBotonAsistencia}>REGISTRAR</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {asistencias.length === 0 ? (
          <Text style={styles.vacio}>Aún no has registrado asistencias.</Text>
        ) : (
          asistencias.map((a: any, i: number) => (
            <View key={a.id_asistencia ?? `a-${i}`} style={styles.cardAsistencia}>
              <Ionicons name="calendar-outline" size={20} color="#4FC3F7" />
              <Text style={styles.textoAsistencia}>{formatearFecha(a.fecha_hora_entrada ?? a.fecha)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  contenido: { padding: 20, paddingBottom: 40 },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 25 },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  subtitulo: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 15, marginTop: 20 },
  vacio: { color: "#444", fontSize: 13, marginBottom: 20 },
  cardRutina: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 10, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: "#222" },
  nombreRutina: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  fecha: { color: "#777", fontSize: 12, marginTop: 3 },
  cardAsistencia: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 10, marginBottom: 8, gap: 12 },
  textoAsistencia: { color: "#AAA", fontSize: 14 },
  
  // Estilos nuevos para el botón
  filaTituloAsistencia: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  botonAsistencia: { backgroundColor: VERDE, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  textoBotonAsistencia: { color: "#000", fontSize: 10, fontWeight: "900" },
});