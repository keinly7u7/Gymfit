import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RUTINAS_DATA } from "../data/rutinasData";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

const OBJETIVOS = [
  { id: "perder", label: "Perder peso", icon: "🔥", color: "#FF4F1F" },
  { id: "ganar", label: "Ganar músculo", icon: "💪", color: VERDE },
  { id: "cardio", label: "Resistencia", icon: "⚡", color: "#4FC3F7" },
];

export default function RutinasScreen() {
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<"perder" | "ganar" | "cardio">("ganar");

  const rutinasFiltradas = RUTINAS_DATA.filter((r) => r.objetivo === objetivoSeleccionado);
  const objetivoActual = OBJETIVOS.find((o) => o.id === objetivoSeleccionado)!;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        
        <View style={styles.encabezado}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={VERDE} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Rutinas</Text>
        </View>

        <Text style={styles.label}>TU OBJETIVO</Text>
        <View style={styles.gridObjetivos}>
          {OBJETIVOS.map((obj) => {
            const activo = objetivoSeleccionado === obj.id;
            return (
              <TouchableOpacity
                key={obj.id}
                style={[styles.tarjetaObjetivo, activo && { borderColor: obj.color, backgroundColor: `${obj.color}15` }]}
                onPress={() => setObjetivoSeleccionado(obj.id as any)}
              >
                <Text style={styles.iconoObjetivo}>{obj.icon}</Text>
                <Text style={[styles.textoObjetivo, activo && { color: obj.color }]}>{obj.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filaTitulo}>
          <Text style={styles.tituloSeccion}>Rutinas recomendadas</Text>
          <Text style={{ fontSize: 20 }}>{objetivoActual.icon}</Text>
        </View>
        <Text style={styles.subtituloSeccion}>Disponibles para todos los clientes</Text>

        {rutinasFiltradas.map((rutina) => (
          <View key={rutina.id} style={styles.tarjetaRutina}>
            <View style={[styles.lineaColor, { backgroundColor: rutina.color }]} />
            <View style={styles.contenidoRutina}>
              <View style={styles.filaEntre}>
                <Text style={styles.nombreRutina}>{rutina.nombre}</Text>
                <View style={[styles.badgeDificultad, { backgroundColor: `${rutina.color}20` }]}>
                  <Text style={[styles.textoDificultad, { color: rutina.color }]}>{rutina.dificultad}</Text>
                </View>
              </View>
              
              <View style={styles.detalles}>
                <View style={styles.detalleItem}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.textoDetalle}>{rutina.duracion}</Text>
                </View>
                <View style={styles.detalleItem}>
                  <Ionicons name="barbell-outline" size={14} color="#666" />
                  <Text style={styles.textoDetalle}>{rutina.ejercicios} ejercicios</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={{ marginTop: 15, paddingVertical: 12, borderRadius: 10, alignItems: "center", backgroundColor: `${rutina.color}20` }}
                onPress={() => router.push({ pathname: "/rutinas-detalle", params: { id_rutina: rutina.id } } as any)}
              >
                <Text style={{ color: rutina.color, fontSize: 12, fontWeight: "900", textTransform: "uppercase" }}>Ver Ejercicios</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  contenido: { padding: 20, paddingBottom: 40 },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 25 },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  label: { color: "#555", fontSize: 11, fontWeight: "900", letterSpacing: 1, marginBottom: 10 },
  gridObjetivos: { flexDirection: "row", gap: 10, marginBottom: 30 },
  tarjetaObjetivo: { flex: 1, backgroundColor: TARJETA, borderRadius: 15, paddingVertical: 15, alignItems: "center", borderWidth: 1, borderColor: "transparent" },
  iconoObjetivo: { fontSize: 24, marginBottom: 8 },
  textoObjetivo: { color: "#444", fontSize: 10, fontWeight: "900", textTransform: "uppercase", textAlign: "center" },
  filaTitulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  tituloSeccion: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  subtituloSeccion: { color: "#555", fontSize: 12, marginBottom: 15 },
  tarjetaRutina: { flexDirection: "row", backgroundColor: TARJETA, borderRadius: 18, marginBottom: 15, overflow: "hidden", borderWidth: 1, borderColor: "#222" },
  lineaColor: { width: 5, height: "100%" },
  contenidoRutina: { flex: 1, padding: 18 },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  nombreRutina: { color: "#FFF", fontSize: 17, fontWeight: "bold", flex: 1 },
  badgeDificultad: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  textoDificultad: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  detalles: { flexDirection: "row", gap: 15, marginBottom: 15 },
  detalleItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  textoDetalle: { color: "#666", fontSize: 12 },
});