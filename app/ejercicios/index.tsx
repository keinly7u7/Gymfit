import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EJERCICIOS_DATA } from "../../data/ejerciciosdata";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

const GRUPOS = ["Todos", "Pecho", "Espalda", "Piernas", "Brazos", "Hombros", "Core", "Cardio"];

export default function EjerciciosScreen() {
  const [busqueda, setBusqueda] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("Todos");

  const ejerciciosFiltrados = useMemo(() => {
    return EJERCICIOS_DATA.filter((ej) => {
      const coincideBusqueda = ej.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideGrupo = grupoSeleccionado === "Todos" || ej.grupo.toLowerCase() === grupoSeleccionado.toLowerCase();
      return coincideBusqueda && coincideGrupo;
    });
  }, [busqueda, grupoSeleccionado]);

  return (
    <SafeAreaView style={styles.contenedor}>
      {/* ENCABEZADO */}
      <View style={styles.encabezado}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Ejercicios</Text>
      </View>

      {/* BUSCADOR */}
      <View style={styles.buscadorContainer}>
        <Ionicons name="search-outline" size={20} color="#555" />
        <TextInput
          style={styles.inputBusqueda}
          placeholder="Buscar ejercicio..."
          placeholderTextColor="#444"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS */}
      <View style={{ marginBottom: 15 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContainer}>
          {GRUPOS.map((grupo) => {
            const activo = grupoSeleccionado === grupo;
            return (
              <TouchableOpacity
                key={grupo}
                style={[styles.filtroChip, activo && styles.filtroChipActivo]}
                onPress={() => setGrupoSeleccionado(grupo)}
              >
                <Text style={[styles.textoFiltro, activo && styles.textoFiltroActivo]}>
                  {grupo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* LISTA DE EJERCICIOS - CADA TARJETA ES UN BOTÓN */}
      <FlatList
        data={ejerciciosFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.textoVacio}>No se encontraron ejercicios con esos filtros.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.tarjetaEjercicio}
            activeOpacity={0.7}
            onPress={() => router.push({ 
              pathname: "/ejercicios-detalle", 
              params: { id_ejercicio: item.id } 
            } as any)}
          >
            <Image source={{ uri: item.imagen }} style={styles.imagenEjercicio} />
            <View style={styles.infoEjercicio}>
              <Text style={styles.nombreEjercicio}>{item.nombre}</Text>
              <Text style={styles.detalleEjercicio}>{item.grupo} · {item.nivel}</Text>
              <Text style={styles.descripcionEjercicio} numberOfLines={2}>
                {item.descripcion}
              </Text>
            </View>
            <View style={styles.botonPlay}>
              <Ionicons name="chevron-forward" size={18} color={VERDE} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO, padding: 20 },
  encabezado: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 20 },
  titulo: { color: "#FFF", fontSize: 28, fontWeight: "900" },
  
  buscadorContainer: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 15, marginBottom: 15, gap: 10 },
  inputBusqueda: { flex: 1, color: "#FFF", fontSize: 15 },
  
  filtrosContainer: { gap: 8 },
  filtroChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: "#1A1A1A" },
  filtroChipActivo: { backgroundColor: VERDE },
  textoFiltro: { color: "#666", fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  textoFiltroActivo: { color: "#000" },
  
  tarjetaEjercicio: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 12, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#222" },
  imagenEjercicio: { width: 65, height: 65, borderRadius: 12, backgroundColor: "#1A1A1A" },
  infoEjercicio: { flex: 1, marginLeft: 12 },
  nombreEjercicio: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  detalleEjercicio: { color: VERDE, fontSize: 11, fontWeight: "bold", marginTop: 2, textTransform: "capitalize" },
  descripcionEjercicio: { color: "#666", fontSize: 12, marginTop: 4 },
  botonPlay: { width: 35, height: 35, borderRadius: 18, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginLeft: 10 },
  
  textoVacio: { color: "#444", textAlign: "center", marginTop: 40, fontSize: 14 }
});