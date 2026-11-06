import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../constants/api";

type IconName = keyof typeof Ionicons.glyphMap;

const modulos = [
  { titulo: "Clientes", descripcion: "Consultar y gestionar los clientes", icono: "people-outline" as IconName },
  { titulo: "Entrenadores", descripcion: "Consultar y gestionar entrenadores", icono: "barbell-outline" as IconName },
  { titulo: "Membresías", descripcion: "Planes, estados y vencimientos", icono: "card-outline" as IconName },
  { titulo: "Asignar entrenador", descripcion: "Vincular entrenadores con clientes", icono: "person-add-outline" as IconName },
  { titulo: "Asistencia", descripcion: "Consultar registros de asistencia", icono: "calendar-outline" as IconName },
  { titulo: "Reportes", descripcion: "Consultar resúmenes del gimnasio", icono: "stats-chart-outline" as IconName },
];

export default function DashboardAdministrador() {
  const [busqueda, setBusqueda] = useState("");
  const params = useLocalSearchParams<{ access_token?: string }>();
  const [token, setToken] = useState(params.access_token || "");

  const [datosReales, setDatosReales] = useState({
    clientes_totales: 0,
    clientes_activos: 0,
    membresias_vencidas: 0,
    asistencia_hoy: 0,
  });

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
          const res = await fetch(`${API_URL}/api/admin/indicadores`, {
            headers: { Authorization: `Bearer ${t}` }
          });
          if (activo && res.ok) setDatosReales(await res.json());
        } catch (e) {
          console.log("Error:", e);
        }
      }
      cargar();
      return () => { activo = false; };
    }, [token])
  );

  const abrirModulo = (titulo: string) => {
    if (titulo === "Clientes") router.push("/admin/clientes" as any);
    else if (titulo === "Entrenadores") router.push("/admin/entrenadores" as any);
    else if (titulo === "Membresías") router.push("/admin/membresias" as any);
    else if (titulo === "Asignar entrenador") router.push("/admin/asignar-entrenador" as any);
    else if (titulo === "Asistencia") router.push("/admin/asistencia" as any);
    else if (titulo === "Reportes") router.push("/admin/reportes" as any);
    else Alert.alert(titulo, "Módulo en construcción.");
  };

  const cerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir de GymFit?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("access_token");
          router.replace("/login");
        },
      },
    ]);
  };

  const modulosFiltrados = modulos.filter((modulo) =>
    `${modulo.titulo} ${modulo.descripcion}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const indicadoresReales = [
    { titulo: "Clientes totales", valor: String(datosReales.clientes_totales), icono: "people-outline" as IconName, color: "#CFFF00" },
    { titulo: "Clientes activos", valor: String(datosReales.clientes_activos), icono: "person-add-outline" as IconName, color: "#7DDE91" },
    { titulo: "Membresías vencidas", valor: String(datosReales.membresias_vencidas), icono: "alert-circle-outline" as IconName, color: "#FF9C66" },
    { titulo: "Asistencia de hoy", valor: String(datosReales.asistencia_hoy), icono: "calendar-outline" as IconName, color: "#75B9FF" },
  ];

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.logo}>GYMFIT</Text>
            <Text style={styles.subtitulo}>PANEL DE ADMINISTRACIÓN</Text>
          </View>
          <TouchableOpacity style={styles.botonPerfil} onPress={() => abrirModulo("Mi perfil")}>
            <Ionicons name="person-circle-outline" size={29} color="#CFFF00" />
          </TouchableOpacity>
        </View>

        <View style={styles.bienvenida}>
          <View style={styles.filaBienvenida}>
            <View style={styles.textoBienvenida}>
              <Text style={styles.saludo}>¡Hola!</Text>
              <Text style={styles.nombre}>Administrador</Text>
              <Text style={styles.descripcionBienvenida}>Gestiona tu gimnasio desde un solo lugar.</Text>
            </View>
            <View style={styles.iconoBienvenida}>
              <Ionicons name="shield-checkmark-outline" size={36} color="#CFFF00" />
            </View>
          </View>
          <View style={styles.etiquetaAdmin}>
            <View style={styles.puntoVerde} />
            <Text style={styles.textoEtiqueta}>PANEL ADMINISTRATIVO</Text>
          </View>
        </View>

        
        <View style={styles.rejillaIndicadores}>
          {indicadoresReales.map((item) => (
            <View key={item.titulo} style={styles.tarjetaIndicador}>
              <View style={styles.filaIndicador}>
                <Ionicons name={item.icono} size={23} color={item.color} />
                <Text style={styles.valorIndicador}>{item.valor}</Text>
              </View>
              <Text style={styles.tituloIndicador}>{item.titulo}</Text>
             
            </View>
          ))}
        </View>

        <View style={styles.busqueda}>
          <Ionicons name="search-outline" size={21} color="#888888" />
          <TextInput
            style={styles.inputBusqueda}
            placeholder="Buscar una sección..."
            placeholderTextColor="#777777"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={21} color="#888888" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.tituloSeccion}>GESTIÓN DEL GIMNASIO</Text>
        <Text style={styles.textoSeccion}>Accede a las diferentes herramientas administrativas.</Text>

        <View style={styles.listaModulos}>
          {modulosFiltrados.map((modulo) => (
            <TouchableOpacity
              key={modulo.titulo}
              style={styles.tarjetaModulo}
              activeOpacity={0.75}
              onPress={() => abrirModulo(modulo.titulo)}
            >
              <View style={styles.iconoModulo}>
                <Ionicons name={modulo.icono} size={25} color="#CFFF00" />
              </View>
              <View style={styles.infoModulo}>
                <Text style={styles.nombreModulo}>{modulo.titulo}</Text>
                <Text style={styles.descripcionModulo}>{modulo.descripcion}</Text>
              </View>
              <Ionicons name="chevron-forward" size={21} color="#CFFF00" />
            </TouchableOpacity>
          ))}

          {modulosFiltrados.length === 0 && (
            <View style={styles.sinResultados}>
              <Ionicons name="search-outline" size={30} color="#777777" />
              <Text style={styles.textoSinResultados}>No se encontraron secciones.</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Ionicons name="log-out-outline" size={21} color="#FF7777" />
          <Text style={styles.textoCerrarSesion}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.pie}>GYMFIT · ADMINISTRACIÓN</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#111111" },
  contenido: { padding: 22, paddingBottom: 35 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  logo: { color: "#CFFF00", fontSize: 30, fontWeight: "900", letterSpacing: 3 },
  subtitulo: { color: "#AAAAAA", fontSize: 10, letterSpacing: 1.8, marginTop: 6 },
  botonPerfil: { width: 48, height: 48, borderRadius: 15, borderWidth: 1, borderColor: "#383838", alignItems: "center", justifyContent: "center" },
  bienvenida: { backgroundColor: "#1B1B1B", borderRadius: 20, borderWidth: 1, borderColor: "#333333", padding: 20, marginBottom: 29 },
  filaBienvenida: { flexDirection: "row", alignItems: "center" },
  textoBienvenida: { flex: 1, paddingRight: 8 },
  saludo: { color: "#AAAAAA", fontSize: 15 },
  nombre: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", marginTop: 5 },
  descripcionBienvenida: { color: "#AAAAAA", fontSize: 13, lineHeight: 20, marginTop: 9 },
  iconoBienvenida: { width: 66, height: 66, borderRadius: 20, backgroundColor: "#292D12", alignItems: "center", justifyContent: "center" },
  etiquetaAdmin: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#292D12", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginTop: 19, gap: 8 },
  puntoVerde: { width: 7, height: 7, borderRadius: 5, backgroundColor: "#CFFF00" },
  textoEtiqueta: { color: "#CFFF00", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  encabezadoSeccion: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  tituloSeccion: { color: "#CFFF00", fontSize: 13, fontWeight: "900", letterSpacing: 1.3, marginBottom: 15 },
  rejillaIndicadores: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 28 },
  tarjetaIndicador: { width: "48.2%", backgroundColor: "#1B1B1B", borderRadius: 15, borderWidth: 1, borderColor: "#303030", padding: 14, marginBottom: 12, minHeight: 125 },
  filaIndicador: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  valorIndicador: { color: "#FFFFFF", fontSize: 25, fontWeight: "900" },
  tituloIndicador: { color: "#EEEEEE", fontSize: 12, fontWeight: "700", lineHeight: 17 },
  notaIndicador: { color: "#777777", fontSize: 10, marginTop: 5 },
  busqueda: { minHeight: 50, backgroundColor: "#1B1B1B", borderWidth: 1, borderColor: "#383838", borderRadius: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 27, gap: 10 },
  inputBusqueda: { flex: 1, color: "#FFFFFF", fontSize: 14, paddingVertical: 12 },
  textoSeccion: { color: "#999999", fontSize: 13, marginTop: -6, marginBottom: 17 },
  listaModulos: { marginBottom: 27 },
  tarjetaModulo: { flexDirection: "row", alignItems: "center", backgroundColor: "#1B1B1B", borderRadius: 15, borderWidth: 1, borderColor: "#303030", padding: 14, marginBottom: 11 },
  iconoModulo: { width: 48, height: 48, borderRadius: 13, backgroundColor: "#292D12", alignItems: "center", justifyContent: "center" },
  infoModulo: { flex: 1, marginHorizontal: 13 },
  nombreModulo: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  descripcionModulo: { color: "#999999", fontSize: 12, lineHeight: 18, marginTop: 5 },
  sinResultados: { alignItems: "center", padding: 25, backgroundColor: "#1B1B1B", borderRadius: 15 },
  textoSinResultados: { color: "#999999", marginTop: 10 },
  botonCerrarSesion: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#553333", borderRadius: 12, padding: 14, marginTop: 24, gap: 9 },
  textoCerrarSesion: { color: "#FF7777", fontSize: 14, fontWeight: "700" },
  pie: { color: "#666666", fontSize: 10, letterSpacing: 2, textAlign: "center", marginTop: 22 },
});