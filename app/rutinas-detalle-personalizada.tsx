import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function DetalleRutinaPersonalizada() {
  const { id_rutina } = useLocalSearchParams<{ id_rutina: string }>();
  const [rutina, setRutina] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      try {
        const res = await fetch(`${API_URL}/api/mis-rutinas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const encontrada = data.find(
            (r: any) => r.id_rutina === Number(id_rutina) && r.es_general === 0
          );
          setRutina(encontrada);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id_rutina]);

  const completarRutina = async () => {
    if (!rutina || guardando) return;
    setGuardando(true);
    const token = await SecureStore.getItemAsync("access_token");

    try {
      // Mandamos AMBOS campos para que funcione con cualquier backend
      const body = {
        id_rutina: rutina.id_rutina,
        nombre_rutina: rutina.nombre,
      };
      console.log("POST completar-rutina:", body);

      const res = await fetch(`${API_URL}/api/completar-rutina`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const texto = await res.text();
      console.log("STATUS:", res.status, "BODY:", texto);

      if (res.ok) {
        Alert.alert(
          "¡Felicidades!",
          `Has completado: ${rutina.nombre}`,
          [{ text: "Ver mi progreso", onPress: () => router.replace("/progreso" as any) },
           { text: "Volver", onPress: () => router.back(), style: "cancel" }]
        );
      } else {
        let msg = "No se pudo guardar.";
        try { msg = JSON.parse(texto).detail || msg; } catch {}
        Alert.alert("Error", msg);
      }
    } catch (e) {
      console.log("ERROR:", e);
      Alert.alert("Error", "Problema de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator color={VERDE} size="large" />
      </SafeAreaView>
    );
  }
  if (!rutina) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={{ color: "#FFF" }}>Rutina no encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>{rutina.nombre}</Text>
        <Text style={styles.detalles}>
          {rutina.nivel} · {rutina.duracion || "Personalizada"}
        </Text>

        <Text style={styles.subtitulo}>EJERCICIOS A REALIZAR</Text>

        {rutina.ejercicios?.map((ej: any, i: number) => (
          <View key={ej.id_ejercicio ?? i} style={styles.tarjeta}>
            <View style={styles.numero}>
              <Text style={styles.numeroTexto}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombreEjercicio}>{ej.nombre}</Text>
              <Text style={styles.grupo}>{ej.grupo_muscular}</Text>
              <Text style={styles.detalle}>
                Series: {ej.series} · Reps: {ej.repeticiones}
              </Text>
              {ej.indicaciones && (
                <Text style={styles.indicaciones}>{ej.indicaciones}</Text>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.botonCompletar, guardando && { opacity: 0.6 }]}
          onPress={completarRutina}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#000" />
              <Text style={styles.textoBotonCompletar}>MARCAR COMO COMPLETADA</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  contenido: { padding: 20, paddingBottom: 40 },
  volver: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 5 },
  detalles: { color: "#888", fontSize: 13, marginBottom: 25, textTransform: "capitalize" },
  subtitulo: { color: "#FFF", fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  tarjeta: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: "#222", gap: 12 },
  numero: { width: 35, height: 35, borderRadius: 10, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  numeroTexto: { color: VERDE, fontSize: 16, fontWeight: "bold" },
  nombreEjercicio: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  grupo: { color: VERDE, fontSize: 11, marginTop: 3, textTransform: "capitalize" },
  detalle: { color: "#AAA", fontSize: 12, marginTop: 5 },
  indicaciones: { color: "#777", fontSize: 11, marginTop: 5, lineHeight: 16 },
  botonCompletar: { backgroundColor: VERDE, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 16, borderRadius: 12, marginTop: 20, gap: 8 },
  textoBotonCompletar: { color: "#000", fontSize: 14, fontWeight: "900" },
});