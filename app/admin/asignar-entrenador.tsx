import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

export default function AsignarEntrenador() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [entrenadores, setEntrenadores] = useState<any[]>([]);
  const [clienteSel, setClienteSel] = useState<number | null>(null);
  const [entrenadorSel, setEntrenadorSel] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      const token = await SecureStore.getItemAsync("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [resC, resE] = await Promise.all([
          fetch(`${API_URL}/api/admin/clientes-elegibles`, { headers }),
          fetch(`${API_URL}/api/admin/entrenadores`, { headers })
        ]);
        if (resC.ok) setClientes(await resC.json());
        if (resE.ok) setEntrenadores(await resE.json());
      } catch (e) {
        Alert.alert("Error", "No se pudieron cargar los datos");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const asignar = async () => {
    if (!clienteSel || !entrenadorSel) {
      Alert.alert("Atención", "Selecciona un cliente y un entrenador.");
      return;
    }
    setGuardando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/admin/asignar-entrenador`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_cliente: clienteSel, id_entrenador: entrenadorSel })
      });
      if (res.ok) {
        Alert.alert("¡Éxito!", "Entrenador asignado correctamente al cliente.");
        setClienteSel(null);
        setEntrenadorSel(null);
      } else {
        const err = await res.json();
        Alert.alert("Error", err.detail || "No se pudo asignar");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#CFFF00" size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#CFFF00" />
        </TouchableOpacity>
        <Text style={styles.title}>Asignar Entrenador</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        <Text style={styles.label}>1. SELECCIONA UN CLIENTE</Text>
        {clientes.map((c) => (
          <TouchableOpacity
            key={c.id_cliente}
            style={[styles.item, clienteSel === c.id_cliente && styles.itemSelected]}
            onPress={() => setClienteSel(c.id_cliente)}
          >
            <Ionicons name={clienteSel === c.id_cliente ? "radio-button-on" : "radio-button-off"} size={20} color="#CFFF00" />
            <Text style={styles.itemText}>{c.nombres} {c.apellidos}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.label, { marginTop: 25 }]}>2. SELECCIONA UN ENTRENADOR</Text>
        {entrenadores.length === 0 ? (
          <Text style={{ color: "#A5A5A5", textAlign: "center" }}>No hay entrenadores registrados. Crea uno primero.</Text>
        ) : (
          entrenadores.map((e) => (
            <TouchableOpacity
              key={e.id_usuario}
              style={[styles.item, entrenadorSel === e.id_usuario && styles.itemSelected]}
              onPress={() => setEntrenadorSel(e.id_usuario)}
            >
              <Ionicons name={entrenadorSel === e.id_usuario ? "radio-button-on" : "radio-button-off"} size={20} color="#CFFF00" />
              <Text style={styles.itemText}>{e.nombres} {e.apellidos}</Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity 
          style={[styles.btn, (!clienteSel || !entrenadorSel || guardando) && { opacity: 0.5 }]} 
          onPress={asignar}
          disabled={!clienteSel || !entrenadorSel || guardando}
        >
          {guardando ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>GUARDAR ASIGNACIÓN</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  botonCrear: { backgroundColor: "#CFFF00", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 12, gap: 8, marginBottom: 25 },
  textoBotonCrear: { color: "#000", fontWeight: "900", fontSize: 13 },
  label: { color: "#CFFF00", fontSize: 12, fontWeight: "900", marginBottom: 10, letterSpacing: 1 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", padding: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#303030", gap: 10 },
  itemSelected: { borderColor: "#CFFF00", backgroundColor: "#1A1F0A" },
  itemText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  btn: { backgroundColor: "#CFFF00", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 30 },
  btnText: { color: "#000", fontWeight: "900", fontSize: 14 }
});