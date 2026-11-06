import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

export default function AsignarRutina() {
  const [rutinas, setRutinas] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [rutinaSel, setRutinaSel] = useState<number | null>(null);
  const [clienteSel, setClienteSel] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [resR, resC] = await Promise.all([
        fetch(`${API_URL}/api/entrenador/rutinas`, { headers }),
        fetch(`${API_URL}/api/entrenador/mis-clientes`, { headers })
      ]);
      if (resR.ok) setRutinas(await resR.json());
      if (resC.ok) setClientes(await resC.json());
      setCargando(false);
    }
    cargar();
  }, []);

  const asignar = async () => {
    if (!rutinaSel || !clienteSel) {
      Alert.alert("Atención", "Selecciona una rutina y un cliente.");
      return;
    }
    setGuardando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/entrenador/asignar-rutina`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_rutina: rutinaSel, id_cliente: clienteSel })
      });
      if (res.ok) {
        Alert.alert("¡Éxito!", "Rutina asignada al cliente.");
        router.back();
      } else {
        Alert.alert("Error", "No se pudo asignar.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <SafeAreaView style={styles.container}><ActivityIndicator color="#CFFF00" size="large" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#CFFF00" /></TouchableOpacity>
        <Text style={styles.title}>Asignar Rutina</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.label}>1. SELECCIONA UNA RUTINA</Text>
        {rutinas.map(r => (
          <TouchableOpacity key={r.id_rutina} style={[styles.item, rutinaSel === r.id_rutina && styles.itemSel]} onPress={() => setRutinaSel(r.id_rutina)}>
            <Ionicons name={rutinaSel === r.id_rutina ? "radio-button-on" : "radio-button-off"} size={20} color="#CFFF00" />
            <Text style={styles.itemText}>{r.nombre}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.label, { marginTop: 25 }]}>2. SELECCIONA UN CLIENTE</Text>
        {clientes.map(c => (
          <TouchableOpacity key={c.id_cliente} style={[styles.item, clienteSel === c.id_cliente && styles.itemSel]} onPress={() => setClienteSel(c.id_cliente)}>
            <Ionicons name={clienteSel === c.id_cliente ? "radio-button-on" : "radio-button-off"} size={20} color="#CFFF00" />
            <Text style={styles.itemText}>{c.nombres} {c.apellidos}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.btn} onPress={asignar} disabled={guardando}>
          {guardando ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>ASIGNAR RUTINA</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  title: { color: "#FFF", fontSize: 22, fontWeight: "900" },
  label: { color: "#CFFF00", fontSize: 12, fontWeight: "900", marginBottom: 10 },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: "#151515", padding: 15, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: "#303030", gap: 10 },
  itemSel: { borderColor: "#CFFF00", backgroundColor: "#1A1F0A" },
  itemText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  btn: { backgroundColor: "#CFFF00", padding: 16, borderRadius: 12, alignItems: "center", marginTop: 30 },
  btnText: { color: "#000", fontWeight: "900", fontSize: 14 }
});