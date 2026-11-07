import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EJERCICIOS_DATA } from "../data/ejerciciosdata";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function DetalleEjercicioScreen() {
  const { id_ejercicio } = useLocalSearchParams<{ id_ejercicio: string }>();
  
  // Buscamos el ejercicio por su ID
  const ejercicio = EJERCICIOS_DATA.find((e) => e.id === Number(id_ejercicio));

  if (!ejercicio) {
    return (
      <SafeAreaView style={styles.centro}>
        <Text style={{ color: "#FFF" }}>Ejercicio no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: VERDE }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver a ejercicios</Text>
        </TouchableOpacity>

        <Image source={{ uri: ejercicio.imagen }} style={styles.imagenPrincipal} />
        
        <Text style={styles.titulo}>{ejercicio.nombre}</Text>
        <Text style={styles.subtitulo}>{ejercicio.grupo} · {ejercicio.nivel}</Text>

        <View style={styles.seccion}>
          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.texto}>{ejercicio.descripcion}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.label}>Máquina / Equipo</Text>
          <View style={styles.filaMaquina}>
            <Ionicons name="barbell-outline" size={20} color={VERDE} />
            <Text style={[styles.texto, { marginLeft: 10 }]}>{ejercicio.maquina}</Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.label}>Instrucciones</Text>
          <Text style={styles.texto}>{ejercicio.instrucciones}</Text>
        </View>

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
  imagenPrincipal: { width: "100%", height: 220, borderRadius: 20, backgroundColor: TARJETA, marginBottom: 20 },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 5 },
  subtitulo: { color: VERDE, fontSize: 13, fontWeight: "bold", marginBottom: 25 },
  seccion: { backgroundColor: TARJETA, borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#222" },
  label: { color: "#777", fontSize: 11, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8 },
  texto: { color: "#DDD", fontSize: 14, lineHeight: 22 },
  filaMaquina: { flexDirection: "row", alignItems: "center" }
});