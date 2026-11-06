import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

export default function AdminClientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      const res = await fetch(`${API_URL}/api/admin/clientes`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) setClientes(await res.json());
      setCargando(false);
    }
    cargar();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#CFFF00" />
        </TouchableOpacity>
        <Text style={styles.title}>Clientes</Text>
      </View>
      
      {cargando ? (
        <ActivityIndicator color="#CFFF00" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(i) => String(i.id_cliente)}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={{ color: "#A5A5A5", textAlign: "center" }}>No hay clientes registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconoBox}>
                <Ionicons name="person" size={24} color="#CFFF00" />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.nombres} {item.apellidos}</Text>
                <Text style={styles.text}>{item.correo}</Text>
                <Text style={styles.text}>{item.telefono} • Nivel: {item.nivel_experiencia}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, gap: 15 },
  title: { color: "#FFF", fontSize: 24, fontWeight: "900" },
  card: { flexDirection: "row", backgroundColor: "#151515", padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#303030", gap: 15 },
  iconoBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#272D0B", alignItems: "center", justifyContent: "center" },
  info: { flex: 1, justifyContent: "center" },
  name: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  text: { color: "#A5A5A5", fontSize: 12, marginTop: 3 },
});