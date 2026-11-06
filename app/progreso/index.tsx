import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

export default function MiProgreso() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [registrando, setRegistrando] = useState(false);

  const cargarDatos = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    const [resRut, resAsis] = await Promise.all([
      fetch(`${API_URL}/api/mis-rutinas-completadas`, { headers }),
      fetch(`${API_URL}/api/mis-asistencias`, { headers })
    ]);

    if (resRut.ok) setRutinas(await resRut.json());
    if (resAsis.ok) setAsistencias(await resAsis.json());
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const registrarAsistencia = async () => {
    setRegistrando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/registrar-mi-asistencia`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("¡Éxito!", data.mensaje);
        cargarDatos(); // Recargamos para ver la nueva asistencia
      } else {
        Alert.alert("Aviso", data.detail);
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar");
    } finally {
      setRegistrando(false);
    }
  };

  const formatearFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO", { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const rutinasPorDia = rutinas.reduce((acc: any, rutina: any) => {
    const fecha = formatearFecha(rutina.fecha_completada);
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(rutina);
    return acc;
  }, {});

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color="#E8FF47" size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#E8FF47" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Mi Progreso</Text>
        </View>

        {/* BOTÓN DE ASISTENCIA */}
        <TouchableOpacity 
          style={styles.botonAsistencia} 
          onPress={registrarAsistencia} 
          disabled={registrando}
        >
          {registrando ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#000" />
              <Text style={styles.textoBotonAsistencia}>REGISTRAR MI ASISTENCIA HOY</Text>
            </>
          )}
        </TouchableOpacity>

        {/* RUTINAS COMPLETADAS */}
        <Text style={styles.subtitulo}>RUTINAS COMPLETADAS</Text>
        {Object.keys(rutinasPorDia).length === 0 ? (
          <Text style={styles.vacio}>Aún no has completado rutinas.</Text>
        ) : (
          Object.keys(rutinasPorDia).map((fecha) => (
            <View key={fecha} style={styles.diaContainer}>
              <Text style={styles.diaTitulo}>{fecha}</Text>
              {rutinasPorDia[fecha].map((r: any) => (
                <View key={r.id_completada} style={styles.cardRutina}>
                  <Ionicons name="checkmark-circle" size={20} color="#E8FF47" />
                  <Text style={styles.nombreRutina}>{r.nombre_rutina}</Text>
                </View>
              ))}
            </View>
          ))
        )}

        {/* ASISTENCIAS */}
        <Text style={styles.subtitulo}>ASISTENCIAS AL GIMNASIO</Text>
        {asistencias.length === 0 ? (
          <Text style={styles.vacio}>Aún no has registrado asistencias.</Text>
        ) : (
          asistencias.map(a => (
            <View key={a.id_asistencia} style={styles.cardAsistencia}>
              <Ionicons name="calendar-outline" size={20} color="#4FC3F7" />
              <Text style={styles.textoAsistencia}>{formatearFecha(a.fecha_hora_entrada)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#0A0A0A" },
  contenido: { padding: 20 },
  centro: { flex: 1, backgroundColor: "#0A0A0A", justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 25 },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  subtitulo: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 15, marginTop: 20 },
  vacio: { color: "#444", fontSize: 13, marginBottom: 20 },
  
  botonAsistencia: { backgroundColor: "#E8FF47", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 12, gap: 8, marginBottom: 10 },
  textoBotonAsistencia: { color: "#000", fontWeight: "900", fontSize: 13 },
  
  diaContainer: { marginBottom: 15 },
  diaTitulo: { color: "#E8FF47", fontSize: 14, fontWeight: "900", marginBottom: 8, textTransform: "capitalize" },
  cardRutina: { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", padding: 12, borderRadius: 10, marginBottom: 5, gap: 10, borderWidth: 1, borderColor: "#222" },
  nombreRutina: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  
  cardAsistencia: { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", padding: 15, borderRadius: 12, marginBottom: 8, gap: 10 },
  textoAsistencia: { color: "#AAA", fontSize: 14, textTransform: "capitalize" }
});