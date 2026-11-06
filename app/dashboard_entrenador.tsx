import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function DashboardEntrenador() {
  const params = useLocalSearchParams<{ nombre_usuario?: string; correo_usuario?: string; access_token?: string; }>();
  const [token, setToken] = useState(params.access_token || "");
  const [stats, setStats] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const nombre = params.nombre_usuario || "Entrenador";

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      async function cargar() {
        let t = token;
        if (!t) {
          t = await SecureStore.getItemAsync("access_token") || "";
          setToken(t);
        }
        try {
          const [resStats, resClientes] = await Promise.all([
            fetch(`${API_URL}/api/entrenador/estadisticas`, { headers: { Authorization: `Bearer ${t}` } }),
            fetch(`${API_URL}/api/entrenador/mis-clientes`, { headers: { Authorization: `Bearer ${t}` } })
          ]);
          if (activo && resStats.ok) setStats(await resStats.json());
          if (activo && resClientes.ok) setClientes(await resClientes.json());
        } catch (e) {
          console.log(e);
        } finally {
          if (activo) setCargando(false);
        }
      }
      cargar();
      return () => { activo = false; };
    }, [token])
  );

  const cerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de GymFit?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => { await SecureStore.deleteItemAsync("access_token"); router.replace("/login"); } },
    ]);
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={FONDO} />
      <ScrollView contentContainerStyle={styles.contenido}>
        
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludoPequeno}>Bienvenido, entrenador</Text>
            <Text style={styles.saludo}>{nombre}</Text>
          </View>
          <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
            <Ionicons name="log-out-outline" size={24} color={VERDE} />
          </TouchableOpacity>
        </View>

        <Text style={styles.tituloSeccion}>MIS ESTADÍSTICAS</Text>
        <View style={styles.gridEstadisticas}>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="people-outline" size={24} color="#4FC3F7" />
            <Text style={styles.valorEstadistica}>{stats?.clientes || 0}</Text>
            <Text style={styles.labelEstadistica}>Clientes</Text>
          </View>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="barbell-outline" size={24} color={VERDE} />
            <Text style={styles.valorEstadistica}>{stats?.rutinas || 0}</Text>
            <Text style={styles.labelEstadistica}>Rutinas creadas</Text>
          </View>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="checkmark-done-outline" size={24} color="#FF9C66" />
            <Text style={styles.valorEstadistica}>{stats?.asignaciones || 0}</Text>
            <Text style={styles.labelEstadistica}>Asignaciones activas</Text>
          </View>
        </View>

        <Text style={styles.tituloSeccion}>GESTIÓN DE RUTINAS</Text>
        <View style={styles.filaBotones}>
          <TouchableOpacity style={styles.botonAccion} onPress={() => router.push("/entrenador/crear-rutina" as any)}>
            <Ionicons name="add-circle-outline" size={28} color={VERDE} />
            <Text style={styles.textoBotonAccion}>Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAccion} onPress={() => router.push("/entrenador/asignar-rutina" as any)}>
            <Ionicons name="person-add-outline" size={28} color={VERDE} />
            <Text style={styles.textoBotonAccion}>Asignar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAccion} onPress={() => router.push("/entrenador/mis-rutinas" as any)}>
            <Ionicons name="list-outline" size={28} color={VERDE} />
            <Text style={styles.textoBotonAccion}>Mis rutinas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonAccion} onPress={() => router.push("/entrenador/agenda" as any)}>
  <Ionicons name="calendar-outline" size={28} color={VERDE} />
  <Text style={styles.textoBotonAccion}>Mi Agenda</Text>
</TouchableOpacity>
        </View>

        <Text style={styles.tituloSeccion}>MIS CLIENTES</Text>
        {clientes.length === 0 ? (
          <View style={styles.tarjetaVacia}>
            <Ionicons name="people-outline" size={40} color="#555" />
            <Text style={styles.textoVacio}>No tienes clientes asignados.</Text>
          </View>
        ) : (
          clientes.map((cliente) => (
            <TouchableOpacity
              key={cliente.id_cliente}
              style={styles.tarjetaCliente}
              onPress={() => router.push({ pathname: "/entrenador/cliente-detalle", params: { id_cliente: cliente.id_cliente } } as any)}
            >
              <View style={styles.iconoCliente}><Ionicons name="person" size={22} color={VERDE} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nombreCliente}>{cliente.nombres} {cliente.apellidos}</Text>
                <Text style={styles.correoCliente}>{cliente.correo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  contenido: { padding: 20, paddingBottom: 40 },
  encabezado: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  saludoPequeno: { color: "#555", fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  saludo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginTop: 4 },
  botonSalir: { width: 45, height: 45, borderRadius: 15, backgroundColor: TARJETA, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },
  
  tituloSeccion: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  gridEstadisticas: { flexDirection: "row", gap: 10, marginBottom: 20 },
  tarjetaEstadistica: { flex: 1, backgroundColor: TARJETA, borderRadius: 15, padding: 15, alignItems: "center", gap: 5 },
  valorEstadistica: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 5 },
  labelEstadistica: { color: "#666", fontSize: 10, marginTop: 2, fontWeight: "600", textAlign: "center" },
  
  filaBotones: { flexDirection: "row", gap: 10, marginBottom: 20 },
  botonAccion: { flex: 1, backgroundColor: TARJETA, borderWidth: 1, borderColor: VERDE, borderRadius: 15, paddingVertical: 20, alignItems: "center", justifyContent: "center", gap: 10 },
  textoBotonAccion: { color: VERDE, fontSize: 12, fontWeight: "bold", textAlign: "center" },
  
  tarjetaVacia: { backgroundColor: TARJETA, borderRadius: 15, padding: 30, alignItems: "center" },
  textoVacio: { color: "#888", marginTop: 10, fontSize: 13 },
  
  tarjetaCliente: { flexDirection: "row", alignItems: "center", backgroundColor: TARJETA, padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: "#222", gap: 12 },
  iconoCliente: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  nombreCliente: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  correoCliente: { color: "#666", fontSize: 12, marginTop: 3 },
  
  botonCerrarSesion: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, padding: 15 },
  textoCerrarSesion: { color: "#FF4F1F", fontSize: 14, fontWeight: "bold" }
});