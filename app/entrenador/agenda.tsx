import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function AgendaEntrenador() {
  const [disponibilidad, setDisponibilidad] = useState<any[]>([]);
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    const token = await SecureStore.getItemAsync("access_token");
    const res = await fetch(`${API_URL}/api/entrenador/disponibilidad`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setDisponibilidad(await res.json());
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const formatearFecha = (texto: string) => {
    const digitos = texto.replace(/\D/g, "").slice(0, 8);
    let resultado = digitos;
    if (digitos.length > 6) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 4) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    }
    setFecha(resultado);
  };

  const formatearHora = (texto: string, setter: (v: string) => void) => {
    const digitos = texto.replace(/\D/g, "").slice(0, 4);
    if (digitos.length >= 2) {
      let hh = parseInt(digitos.slice(0, 2), 10);
      if (hh > 23) hh = 23;
      const hhStr = hh.toString().padStart(2, "0");
      if (digitos.length > 2) {
        let mm = parseInt(digitos.slice(2), 10);
        if (mm > 59) mm = 59;
        setter(`${hhStr}:${mm.toString().padStart(2, "0")}`);
      } else {
        setter(hhStr);
      }
    } else {
      setter(digitos);
    }
  };

  const agregar = async () => {
    if (!fecha || !horaInicio || !horaFin) {
      Alert.alert("Atención", "Completa todos los campos.");
      return;
    }
    if (horaFin <= horaInicio) {
      Alert.alert("Error", "La hora fin debe ser mayor que la hora inicio.");
      return;
    }
    setGuardando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/entrenador/disponibilidad`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fecha, hora_inicio: horaInicio, hora_fin: horaFin })
      });
      if (res.ok) {
        setFecha(""); setHoraInicio(""); setHoraFin("");
        cargar();
      } else {
        Alert.alert("Error", "No se pudo guardar.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    const token = await SecureStore.getItemAsync("access_token");
    const res = await fetch(`${API_URL}/api/entrenador/disponibilidad/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) cargar();
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Mi Agenda</Text>
      </View>

      <Text style={styles.label}>AGREGAR DISPONIBILIDAD</Text>
      <TextInput
        style={styles.input}
        placeholder="Fecha (AAAA-MM-DD)"
        placeholderTextColor="#666"
        value={fecha}
        onChangeText={formatearFecha}
        keyboardType="numeric"
      />
      <View style={styles.filaHoras}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Inicio (HH:MM)"
          placeholderTextColor="#666"
          value={horaInicio}
          onChangeText={(t) => formatearHora(t, setHoraInicio)}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Fin (HH:MM)"
          placeholderTextColor="#666"
          value={horaFin}
          onChangeText={(t) => formatearHora(t, setHoraFin)}
          keyboardType="numeric"
        />
      </View>
      <Text style={styles.ayuda}>Formato militar: 08:00, 14:30, 20:00</Text>

      <TouchableOpacity style={styles.botonAgregar} onPress={agregar} disabled={guardando}>
        {guardando ? <ActivityIndicator color="#000" /> : <Text style={styles.textoBoton}>AGREGAR HORARIO</Text>}
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 20 }]}>MIS HORARIOS</Text>
      <FlatList
        data={disponibilidad}
        keyExtractor={(item) => String(item.id_disponibilidad)}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fecha}>{item.fecha}</Text>
              <Text style={styles.hora}>{item.hora_inicio} - {item.hora_fin}</Text>
              {item.cliente_reserva ? (
                <Text style={styles.cliente}>
                  Reservado por: <Text style={{ color: VERDE, fontWeight: "bold" }}>{item.cliente_reserva}</Text>
                </Text>
              ) : (
                <Text style={styles.reservas}>Disponible</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => eliminar(item.id_disponibilidad)}>
              <Ionicons name="trash-outline" size={22} color="#FF4F1F" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No tienes horarios registrados.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO, padding: 20 },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 20 },
  titulo: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  label: { color: "#888", fontSize: 12, fontWeight: "bold", marginBottom: 8 },
  input: { backgroundColor: TARJETA, borderRadius: 10, padding: 14, color: "#FFF", borderWidth: 1, borderColor: "#222", fontSize: 14, marginBottom: 10 },
  filaHoras: { flexDirection: "row", gap: 10 },
  ayuda: { color: "#666", fontSize: 11, marginBottom: 15 },
  botonAgregar: { backgroundColor: VERDE, padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 20 },
  textoBoton: { color: "#000", fontWeight: "900", fontSize: 13 },
  tarjeta: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#222" },
  fecha: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  hora: { color: VERDE, fontSize: 13, marginTop: 3 },
  cliente: { color: "#4FC3F7", fontSize: 12, marginTop: 5 },
  reservas: { color: "#888", fontSize: 11, marginTop: 3 },
  vacio: { color: "#555", textAlign: "center", marginTop: 20 }
});