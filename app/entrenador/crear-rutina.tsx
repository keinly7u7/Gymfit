import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function CrearRutina() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nivel, setNivel] = useState("principiante");
  const [ejercicios, setEjercicios] = useState<any[]>([]);
  const [seleccionados, setSeleccionados] = useState<{ id_ejercicio: number, series: string, repeticiones: string }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      const res = await fetch(`${API_URL}/api/ejercicios`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setEjercicios(await res.json());
      setCargando(false);
    }
    cargar();
  }, []);

  const toggleEjercicio = (id: number) => {
    const yaEsta = seleccionados.find(e => e.id_ejercicio === id);
    if (yaEsta) {
      setSeleccionados(seleccionados.filter(e => e.id_ejercicio !== id));
    } else {
      setSeleccionados([...seleccionados, { id_ejercicio: id, series: "3", repeticiones: "10-12" }]);
    }
  };

  const actualizarSeries = (id: number, series: string) => {
    setSeleccionados(seleccionados.map(e => e.id_ejercicio === id ? { ...e, series } : e));
  };

  const actualizarRepeticiones = (id: number, repeticiones: string) => {
    setSeleccionados(seleccionados.map(e => e.id_ejercicio === id ? { ...e, repeticiones } : e));
  };

  const guardar = async () => {
    if (!nombre || seleccionados.length === 0) {
      Alert.alert("Atención", "Ingresa un nombre y selecciona al menos un ejercicio.");
      return;
    }
    setGuardando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/entrenador/crear-rutina`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, descripcion, nivel, ejercicios: seleccionados })
      });
      if (res.ok) {
        Alert.alert("¡Éxito!", "Rutina creada correctamente.");
        router.back();
      } else {
        const err = await res.json();
        Alert.alert("Error", err.detail || "No se pudo crear la rutina.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión");
    } finally {
      setGuardando(false);
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

        <Text style={styles.titulo}>Crear Rutina</Text>

        <Text style={styles.label}>NOMBRE DE LA RUTINA</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Ej: Rutina de fuerza" placeholderTextColor="#666" />

        <Text style={styles.label}>DESCRIPCIÓN</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Breve descripción" placeholderTextColor="#666" />

        <Text style={styles.label}>NIVEL DE LA RUTINA</Text>
        <View style={styles.filaNiveles}>
          {["principiante", "intermedio", "avanzado"].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.chipNivel, nivel === n && styles.chipNivelActivo]}
              onPress={() => setNivel(n)}
            >
              <Text style={[styles.textoChipNivel, nivel === n && styles.textoChipNivelActivo]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>SELECCIONA LOS EJERCICIOS</Text>
        {ejercicios.map((ej) => {
          const sel = seleccionados.find(e => e.id_ejercicio === ej.id_ejercicio);
          return (
            <View key={ej.id_ejercicio} style={[styles.tarjetaEjercicio, sel && styles.tarjetaEjercicioSel]}>
              <TouchableOpacity style={styles.cabeceraEjercicio} onPress={() => toggleEjercicio(ej.id_ejercicio)}>
                <Ionicons name={sel ? "checkbox" : "square-outline"} size={22} color={VERDE} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.nombreEjercicio}>{ej.nombre}</Text>
                  <Text style={styles.grupoEjercicio}>{ej.grupo_muscular}</Text>
                </View>
              </TouchableOpacity>

              {sel && (
                <View style={styles.filaInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelInput}>Series</Text>
                    <TextInput
                      style={styles.inputSmall}
                      value={sel.series}
                      onChangeText={(v) => actualizarSeries(ej.id_ejercicio, v)}
                      keyboardType="numeric"
                      placeholderTextColor="#666"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labelInput}>Repeticiones</Text>
                    <TextInput
                      style={styles.inputSmall}
                      value={sel.repeticiones}
                      onChangeText={(v) => actualizarRepeticiones(ej.id_ejercicio, v)}
                      placeholderTextColor="#666"
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity style={styles.botonGuardar} onPress={guardar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#000" /> : <Text style={styles.textoBotonGuardar}>GUARDAR RUTINA</Text>}
        </TouchableOpacity>
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
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 20 },
  label: { color: "#555", fontSize: 11, fontWeight: "bold", letterSpacing: 1, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: TARJETA, borderRadius: 10, padding: 15, color: "#FFF", borderWidth: 1, borderColor: "#222", fontSize: 14 },
  filaNiveles: { flexDirection: "row", gap: 10 },
  chipNivel: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: TARJETA, alignItems: "center", borderWidth: 1, borderColor: "#222" },
  chipNivelActivo: { borderColor: VERDE, backgroundColor: `${VERDE}15` },
  textoChipNivel: { color: "#666", fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  textoChipNivelActivo: { color: VERDE },
  
  tarjetaEjercicio: { backgroundColor: TARJETA, borderRadius: 15, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: "#222" },
  tarjetaEjercicioSel: { borderColor: VERDE },
  cabeceraEjercicio: { flexDirection: "row", alignItems: "center" },
  nombreEjercicio: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  grupoEjercicio: { color: "#666", fontSize: 11, marginTop: 3 },
  
  filaInputs: { flexDirection: "row", gap: 15, marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: "#222" },
  labelInput: { color: "#888", fontSize: 10, marginBottom: 5, fontWeight: "bold" },
  inputSmall: { backgroundColor: "#0A0A0A", borderRadius: 8, padding: 10, color: "#FFF", borderWidth: 1, borderColor: "#222", fontSize: 13, textAlign: "center" },
  
  botonGuardar: { backgroundColor: VERDE, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 25 },
  textoBotonGuardar: { color: "#000", fontSize: 14, fontWeight: "900" }
});