import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function MiPerfil() {
  const params = useLocalSearchParams<{
    nombre_usuario?: string;
    correo_usuario?: string;
    nombre_plan?: string;
    estado_membresia?: string;
    fecha_fin?: string;
    precio?: string;
  }>();

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "No disponible";
    const partes = fecha.slice(0, 10).split("-");
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fecha;
  };

  const formatearPrecio = (valor: string) => {
    if (!valor) return "No disponible";
    const numero = Number(valor.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numero) ? `$${numero.toLocaleString("es-CO")}` : valor;
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Mi Perfil</Text>

        {/* DATOS DEL USUARIO */}
        <View style={styles.tarjetaPerfil}>
          <Ionicons name="person-circle-outline" size={80} color={VERDE} style={{ alignSelf: "center", marginBottom: 20 }} />
          <Text style={styles.etiqueta}>NOMBRE COMPLETO</Text>
          <Text style={styles.valor}>{params.nombre_usuario || "Usuario GymFit"}</Text>
          <Text style={styles.etiqueta}>CORREO ELECTRÓNICO</Text>
          <Text style={styles.valor}>{params.correo_usuario || "correo@ejemplo.com"}</Text>
        </View>

        {/* TARJETA DE MEMBRESÍA */}
        <Text style={styles.tituloSeccion}>MI MEMBRESÍA</Text>
        <View style={styles.tarjetaMembresia}>
          <View style={styles.filaEntre}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.iconoMembresia}>
                <Ionicons name="card-outline" size={22} color={VERDE} />
              </View>
              <View>
                <Text style={styles.planNombre}>{params.nombre_plan || "Sin plan"}</Text>
                <Text style={styles.planEstado}>
                  {(params.estado_membresia || "").toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.separador} />
          <View style={styles.filaEntre}>
            <Text style={styles.fechaLabel}>Fecha de vencimiento:</Text>
            <Text style={styles.fechaValor}>{formatearFecha(params.fecha_fin || "")}</Text>
          </View>
          <View style={styles.filaEntre}>
            <Text style={styles.fechaLabel}>Precio:</Text>
            <Text style={styles.fechaValor}>{formatearPrecio(params.precio || "")}</Text>
          </View>
          <TouchableOpacity style={styles.botonRenovar} onPress={() => router.push("/planes")}>
            <Text style={styles.textoBotonRenovar}>GESTIONAR MEMBRESÍA</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  contenido: { padding: 20 },
  volver: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 16, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 28, fontWeight: "900", marginBottom: 20 },
  
  tarjetaPerfil: { backgroundColor: TARJETA, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222", marginBottom: 25 },
  etiqueta: { color: "#A5A5A5", fontSize: 12, fontWeight: "700", marginTop: 15, marginBottom: 5 },
  valor: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  
  tituloSeccion: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 15 },
  tarjetaMembresia: { backgroundColor: TARJETA, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#222" },
  iconoMembresia: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  planNombre: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  planEstado: { color: VERDE, fontSize: 10, fontWeight: "bold", marginTop: 2 },
  separador: { height: 1, backgroundColor: "#222", marginVertical: 15 },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  fechaLabel: { color: "#888", fontSize: 13 },
  fechaValor: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  botonRenovar: { backgroundColor: VERDE, padding: 12, borderRadius: 10, alignItems: "center", marginTop: 15 },
  textoBotonRenovar: { color: "#000", fontSize: 12, fontWeight: "900" }
});