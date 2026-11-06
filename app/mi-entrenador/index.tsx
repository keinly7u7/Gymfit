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

export default function MiEntrenador() {
  const [entrenador, setEntrenador] = useState<any>(null);
  const [nombreEntrenador, setNombreEntrenador] = useState("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const headers = { Authorization: `Bearer ${token}` };

    const [resEnt, resDisp] = await Promise.all([
      fetch(`${API_URL}/api/mi-entrenador`, { headers }),
      fetch(`${API_URL}/api/cliente/disponibilidad-entrenador`, { headers })
    ]);

    if (resEnt.ok) setEntrenador(await resEnt.json());
    if (resDisp.ok) {
      const data = await resDisp.json();
      setNombreEntrenador(data.entrenador || "");
      setHorarios(data.horarios || []);
    }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const reservar = async (id: number) => {
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/cliente/reservar-cita`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_disponibilidad: id })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("¡Reservada!", "Tu cita fue reservada correctamente.");
        cargar();
      } else {
        Alert.alert("Error", data.detail || "No se pudo reservar.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión.");
    }
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Mi Entrenador</Text>

        {/* DATOS DEL ENTRENADOR */}
        {entrenador?.asignado ? (
          <View style={styles.tarjetaEntrenador}>
            <Ionicons name="person-circle-outline" size={70} color={VERDE} style={{ alignSelf: "center", marginBottom: 15 }} />
            <Text style={styles.nombre}>{entrenador.nombres} {entrenador.apellidos}</Text>
            <View style={styles.fila}>
              <Ionicons name="mail-outline" size={18} color="#A5A5A5" />
              <Text style={styles.texto}>{entrenador.correo}</Text>
            </View>
            {entrenador.telefono && (
              <View style={styles.fila}>
                <Ionicons name="call-outline" size={18} color="#A5A5A5" />
                <Text style={styles.texto}>{entrenador.telefono}</Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.texto}>Aún no tienes un entrenador asignado. Contacta al administrador.</Text>
        )}

        {/* HORARIOS DISPONIBLES */}
        {entrenador?.asignado && (
          <>
            <Text style={styles.subtitulo}>AGENDAR CITA</Text>
            {horarios.length === 0 ? (
              <View style={styles.vacio}>
                <Ionicons name="calendar-outline" size={40} color="#555" />
                <Text style={styles.textoVacio}>Tu entrenador no tiene horarios disponibles.</Text>
              </View>
            ) : (
              horarios.map((item) => (
                <View key={item.id_disponibilidad} style={styles.tarjetaHorario}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fecha}>{item.fecha}</Text>
                    <Text style={styles.hora}>{item.hora_inicio} - {item.hora_fin}</Text>
                    {item.reservas > 0 && nombreEntrenador && (
                      <Text style={styles.agendada}>Agendada con {nombreEntrenador}</Text>
                    )}
                  </View>
                  {item.reservas > 0 ? (
                    <Text style={styles.ocupado}>Reservado</Text>
                  ) : (
                    <TouchableOpacity style={styles.botonReservar} onPress={() => reservar(item.id_disponibilidad)}>
                      <Text style={styles.textoReservar}>Reservar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  contenido: { padding: 20 },
  volver: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 16, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 20 },
  subtitulo: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginTop: 20, marginBottom: 12 },
  tarjetaEntrenador: { backgroundColor: TARJETA, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 10 },
  nombre: { color: "#FFF", fontSize: 20, fontWeight: "800", marginBottom: 15, textAlign: "center" },
  fila: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, justifyContent: "center" },
  texto: { color: "#A5A5A5", fontSize: 14, textAlign: "center" },
  vacio: { backgroundColor: TARJETA, borderRadius: 15, padding: 30, alignItems: "center" },
  textoVacio: { color: "#888", marginTop: 10, fontSize: 13 },
  tarjetaHorario: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#222" },
  fecha: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  hora: { color: VERDE, fontSize: 13, marginTop: 3 },
  agendada: { color: "#4FC3F7", fontSize: 11, marginTop: 4, fontWeight: "bold" },
  botonReservar: { backgroundColor: VERDE, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  textoReservar: { color: "#000", fontWeight: "900", fontSize: 12 },
  ocupado: { color: "#FF4F1F", fontWeight: "bold", fontSize: 12 }
});