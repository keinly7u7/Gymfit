import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

export default function AdminEntrenadores() {
  const [entrenadores, setEntrenadores] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const token = await SecureStore.getItemAsync("access_token");
      const res = await fetch(`${API_URL}/api/admin/entrenadores`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.ok) setEntrenadores(await res.json());
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
        <Text style={styles.title}>Entrenadores</Text>
      </View>

      {/* BOTÓN PARA CREAR ENTRENADOR */}
      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() => router.push("/admin/crear-entrenador" as any)}
      >
        <Ionicons name="person-add" size={20} color="#000" />
        <Text style={styles.textoBotonCrear}>CREAR NUEVO ENTRENADOR</Text>
      </TouchableOpacity>
      
      {cargando ? (
        <ActivityIndicator color="#CFFF00" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={entrenadores}
          keyExtractor={(i) => String(i.id_usuario)}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={{ color: "#A5A5A5", textAlign: "center" }}>No hay entrenadores registrados.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.iconoBox}>
                <Ionicons name="barbell" size={24} color="#CFFF00" />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.nombres} {item.apellidos}</Text>
                <Text style={styles.text}>{item.correo}</Text>
                <Text style={styles.text}>{item.telefono}</Text>
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
  botonCrear: { backgroundColor: "#CFFF00", flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 15, borderRadius: 12, gap: 8, marginHorizontal: 20, marginBottom: 10 },
  textoBotonCrear: { color: "#000", fontWeight: "900", fontSize: 13 },
  card: { flexDirection: "row", backgroundColor: "#151515", padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#303030", gap: 15 },
  iconoBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: "#272D0B", alignItems: "center", justifyContent: "center" },
  info: { flex: 1, justifyContent: "center" },
  name: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  text: { color: "#A5A5A5", fontSize: 12, marginTop: 3 },
});