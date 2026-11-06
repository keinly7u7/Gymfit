import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState } from "react";
 // Agrega useCallback
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function DashboardUsuario() {
  const params = useLocalSearchParams<{
    nombre_usuario?: string; correo_usuario?: string; nombre_plan?: string;
    estado_membresia?: string; precio?: string; duracion_dias?: string;
    fecha_fin?: string; fin_membresia?: string; access_token?: string; beneficios?: string;
  }>();

  const [token, setToken] = useState(params.access_token?.toString() || "");
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  const listaBeneficios = useMemo(() => {
    try { return JSON.parse(params.beneficios?.toString() || "[]"); } 
    catch { return []; }
  }, [params.beneficios]);

  const tieneEntrenador = listaBeneficios.includes("ENTRENADOR_ASIGNADO");
  const seguimientoDetallado = listaBeneficios.includes("SEGUIMIENTO_DETALLADO");
  const rutinasPersonalizadas = listaBeneficios.includes("RUTINAS_PERSONALIZADAS");

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
          const res = await fetch(`${API_URL}/api/cliente/dashboard`, {
            headers: { Authorization: `Bearer ${t}` }
          });
          if (activo && res.ok) setData(await res.json());
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
  const nombre = params.nombre_usuario?.toString() || "Usuario";
  const correo = params.correo_usuario?.toString() || "";
  const nombrePlan = params.nombre_plan?.toString() || "";
  const estado = params.estado_membresia?.toString() || "";
  const fechaFin = params.fecha_fin?.toString() || params.fin_membresia?.toString() || "";
  const precio = params.precio?.toString() || "";

  const cerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", style: "destructive", onPress: async () => { await SecureStore.deleteItemAsync("access_token"); router.replace("/login"); } },
    ]);
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        
        {/* ENCABEZADO */}
        <View style={styles.encabezado}>
          <View>
            <Text style={styles.saludoPequeno}>Buenos días</Text>
            <Text style={styles.saludo}>¡Hola, {nombre.split(" ")[0]}! 👋</Text>
            <Text style={styles.planTexto}>Plan {nombrePlan} · {estado}</Text>
          </View>
          <TouchableOpacity style={styles.botonPerfil} onPress={() => router.push({ pathname: "/perfil", params: { nombre_usuario: nombre, correo_usuario: correo, nombre_plan: nombrePlan, estado_membresia: estado, fecha_fin: fechaFin, precio: precio } } as any)}>
            <Ionicons name="person-outline" size={20} color={VERDE} />
          </TouchableOpacity>
        </View>

        {/* TARJETA DE ENTRENAMIENTO DE HOY (Solo si tiene entrenador) */}
        {tieneEntrenador && (
          <>
            <Text style={styles.tituloSeccion}>ENTRENAMIENTO DE HOY</Text>
            {data?.rutina_hoy ? (
              <View style={styles.tarjetaEntrenamiento}>
                <View style={styles.filaEntre}>
                  <Text style={styles.etiquetaVerde}>RUTINA ACTIVA</Text>
                  <Ionicons name="fitness" size={24} color={VERDE} />
                </View>
                <Text style={styles.nombreRutina}>{data.rutina_hoy.nombre}</Text>
                <Text style={styles.detalleRutina}>
                  {data.rutina_hoy.total_ejercicios} ejercicios · {data.rutina_hoy.nivel}
                </Text>
                <TouchableOpacity style={styles.botonComenzar} onPress={() => router.push("/rutinas/personalizadas")}>
                  <Ionicons name="play" size={16} color="#000" />
                  <Text style={styles.textoBotonComenzar}>COMENZAR</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tarjetaVacia}>
                <Ionicons name="barbell-outline" size={32} color="#555" />
                <Text style={styles.textoVacio}>No tienes una rutina asignada hoy.</Text>
              </View>
            )}
          </>
        )}

        {/* ESTADÍSTICAS */}
        <View style={styles.gridEstadisticas}>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="flame-outline" size={22} color="#FF4F1F" />
            <Text style={styles.valorEstadistica}>{data?.dias_activos || 0}</Text>
            <Text style={styles.labelEstadistica}>Días activos</Text>
          </View>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="checkmark-done-outline" size={22} color={VERDE} />
            <Text style={styles.valorEstadistica}>{data?.rutinas_completadas || 0}</Text>
            <Text style={styles.labelEstadistica}>Rutinas completadas</Text>
          </View>
        </View>

        {/* ACCESOS */}
        <Text style={styles.tituloSeccion}>MI ENTRENAMIENTO</Text>
        <View style={styles.listaAccesos}>
          
          <TouchableOpacity style={styles.botonAcceso} onPress={() => router.push("/rutinas" as any)}>
            <View style={styles.iconoAcceso}><Ionicons name="barbell-outline" size={24} color={VERDE} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloAcceso}>Rutinas Generales</Text>
              <Text style={styles.descAcceso}>Explora por objetivo.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
          <View style={styles.separadorAccesos} />

          {rutinasPersonalizadas && (
            <>
              <TouchableOpacity style={styles.botonAcceso} onPress={() => router.push("/rutinas/personalizadas" as any)}>
                <View style={styles.iconoAcceso}><Ionicons name="fitness-outline" size={24} color={VERDE} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tituloAcceso}>Rutinas Personalizadas</Text>
                  <Text style={styles.descAcceso}>Diseñadas por tu entrenador.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#555" />
              </TouchableOpacity>
              <View style={styles.separadorAccesos} />
            </>
          )}

          {tieneEntrenador && (
            <>
              <TouchableOpacity style={styles.botonAcceso} onPress={() => router.push("/mi-entrenador" as any)}>
                <View style={styles.iconoAcceso}><Ionicons name="person-outline" size={24} color={VERDE} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tituloAcceso}>Mi Entrenador</Text>
                  <Text style={styles.descAcceso}>Contacta a tu entrenador.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#555" />
              </TouchableOpacity>
              <View style={styles.separadorAccesos} />
            </>
          )}

          <TouchableOpacity style={styles.botonAcceso} onPress={() => router.push("/progreso" as any)}>
            <View style={styles.iconoAcceso}><Ionicons name="stats-chart-outline" size={24} color={VERDE} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloAcceso}>{seguimientoDetallado ? "Progreso Detallado" : "Mi Progreso"}</Text>
              <Text style={styles.descAcceso}>Asistencias y estadísticas.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
          <View style={styles.separadorAccesos} />

          <TouchableOpacity style={styles.botonAcceso} onPress={() => router.push("/ejercicios" as any)}>
            <View style={styles.iconoAcceso}><Ionicons name="library-outline" size={24} color={VERDE} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloAcceso}>Biblioteca de Ejercicios</Text>
              <Text style={styles.descAcceso}>Explora por grupo muscular.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
          <View style={styles.separadorAccesos} />

          <TouchableOpacity 
            style={styles.botonAcceso} 
            onPress={() => router.push({ 
              pathname: "/perfil", 
              params: { 
                nombre_usuario: nombre, 
                correo_usuario: correo,
                nombre_plan: nombrePlan,
                estado_membresia: estado,
                fecha_fin: fechaFin,
                precio: precio
              } 
            } as any)}
          >
            <View style={styles.iconoAcceso}><Ionicons name="person-circle-outline" size={24} color={VERDE} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloAcceso}>Mi Perfil</Text>
              <Text style={styles.descAcceso}>Tus datos y membresía.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
          <Ionicons name="log-out-outline" size={20} color="#FF4F1F" />
          <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
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
  planTexto: { color: VERDE, fontSize: 12, fontWeight: "bold", marginTop: 4 },
  botonPerfil: { width: 45, height: 45, borderRadius: 15, backgroundColor: TARJETA, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#222" },
  tituloSeccion: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  
  tarjetaEntrenamiento: { backgroundColor: "#1A1A1A", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#333" },
  filaEntre: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  etiquetaVerde: { color: VERDE, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  nombreRutina: { color: "#FFF", fontSize: 22, fontWeight: "900", marginBottom: 5 },
  detalleRutina: { color: "#888", fontSize: 13, marginBottom: 20 },
  botonComenzar: { backgroundColor: VERDE, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 14, borderRadius: 12, gap: 8 },
  textoBotonComenzar: { color: "#000", fontSize: 14, fontWeight: "900" },
  tarjetaVacia: { backgroundColor: TARJETA, borderRadius: 20, padding: 30, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#222" },
  textoVacio: { color: "#888", marginTop: 10, fontSize: 13 },

  gridEstadisticas: { flexDirection: "row", gap: 10, marginBottom: 20 },
  tarjetaEstadistica: { flex: 1, backgroundColor: TARJETA, borderRadius: 15, padding: 15, alignItems: "center" },
  valorEstadistica: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 5 },
  labelEstadistica: { color: "#666", fontSize: 10, marginTop: 2, fontWeight: "600" },

  listaAccesos: { backgroundColor: TARJETA, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#222", marginBottom: 20 },
  botonAcceso: { flexDirection: "row", alignItems: "center", padding: 15 },
  iconoAcceso: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center", marginRight: 15 },
  tituloAcceso: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  descAcceso: { color: "#666", fontSize: 12, marginTop: 3 },
  separadorAccesos: { height: 1, backgroundColor: "#222", marginLeft: 75 },
  botonCerrarSesion: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 10, padding: 15 },
  textoCerrarSesion: { color: "#FF4F1F", fontSize: 14, fontWeight: "bold" }
});