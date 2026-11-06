import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function AdminReportes() {
  const [data, setData] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      try {
        const res = await fetch(`${API_URL}/api/admin/reportes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setData(await res.json());
      } catch (e) {
        console.log(e);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const formatearMoneda = (valor: number) => {
    return `$${Number(valor).toLocaleString("es-CO")}`;
  };

  if (cargando) return <SafeAreaView style={styles.centro}><ActivityIndicator color={VERDE} size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={VERDE} />
          </TouchableOpacity>
          <Text style={styles.titulo}>Reportes</Text>
        </View>

        {/* INGRESOS TOTALES */}
        <View style={styles.tarjetaDestacada}>
          <Ionicons name="cash-outline" size={32} color={VERDE} />
          <Text style={styles.labelDestacada}>Ingresos totales</Text>
          <Text style={styles.valorDestacado}>{formatearMoneda(data?.ingresos_totales || 0)}</Text>
          <Text style={styles.notaDestacada}>Pagos aprobados</Text>
        </View>

        {/* ESTADÍSTICAS DEL MES */}
        <Text style={styles.tituloSeccion}>ESTE MES</Text>
        <View style={styles.grid}>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="calendar-outline" size={24} color="#4FC3F7" />
            <Text style={styles.valor}>{data?.asistencias_mes || 0}</Text>
            <Text style={styles.label}>Asistencias</Text>
          </View>
          <View style={styles.tarjetaEstadistica}>
            <Ionicons name="checkmark-done-outline" size={24} color="#FF9C66" />
            <Text style={styles.valor}>{data?.rutinas_mes || 0}</Text>
            <Text style={styles.label}>Rutinas completadas</Text>
          </View>
        </View>

        {/* MEMBRESÍAS POR PLAN */}
        <Text style={styles.tituloSeccion}>MEMBRESÍAS ACTIVAS POR PLAN</Text>
        <View style={styles.tarjetaLista}>
          {data?.por_plan?.map((p: any, i: number) => (
            <View key={i} style={styles.filaPlan}>
              <View style={styles.iconoPlan}>
                <Ionicons name="card" size={18} color={VERDE} />
              </View>
              <Text style={styles.nombrePlan}>{p.nombre}</Text>
              <Text style={styles.cantidadPlan}>{p.total}</Text>
            </View>
          ))}
          <View style={styles.separador} />
          <View style={styles.filaPlan}>
            <View style={styles.iconoPlan}>
              <Ionicons name="albums-outline" size={18} color={VERDE} />
            </View>
            <Text style={[styles.nombrePlan, { fontWeight: "900" }]}>Total membresías</Text>
            <Text style={[styles.cantidadPlan, { color: VERDE }]}>{data?.total_membresias || 0}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  centro: { flex: 1, backgroundColor: FONDO, justifyContent: "center", alignItems: "center" },
  contenido: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 15, marginBottom: 25 },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900" },
  
  tarjetaDestacada: { backgroundColor: TARJETA, borderRadius: 20, padding: 25, alignItems: "center", marginBottom: 25, borderWidth: 1, borderColor: "#222" },
  labelDestacada: { color: "#888", fontSize: 12, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 1, marginTop: 12 },
  valorDestacado: { color: VERDE, fontSize: 36, fontWeight: "900", marginTop: 8 },
  notaDestacada: { color: "#555", fontSize: 11, marginTop: 5 },
  
  tituloSeccion: { color: "#555", fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  
  grid: { flexDirection: "row", gap: 10, marginBottom: 20 },
  tarjetaEstadistica: { flex: 1, backgroundColor: TARJETA, borderRadius: 15, padding: 15, alignItems: "center", gap: 5 },
  valor: { color: "#FFF", fontSize: 22, fontWeight: "900", marginTop: 5 },
  label: { color: "#666", fontSize: 10, marginTop: 2, fontWeight: "600", textAlign: "center" },
  
  tarjetaLista: { backgroundColor: TARJETA, borderRadius: 20, padding: 5, borderWidth: 1, borderColor: "#222", marginBottom: 20 },
  filaPlan: { flexDirection: "row", alignItems: "center", padding: 15, gap: 12 },
  iconoPlan: { width: 35, height: 35, borderRadius: 10, backgroundColor: "#1A1A1A", justifyContent: "center", alignItems: "center" },
  nombrePlan: { color: "#DDD", fontSize: 14, fontWeight: "600", flex: 1 },
  cantidadPlan: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  separador: { height: 1, backgroundColor: "#222", marginHorizontal: 15 }
});