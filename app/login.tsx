import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../constants/api";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async () => {
    if (cargando) return;

    if (!correo.trim() || !contrasena) {
      Alert.alert("Campos requeridos", "Ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          contrasena,
        }),
      });

      const datos = await respuesta.json();
      console.log("LOGIN RESPUESTA:", JSON.stringify(datos, null, 2));

      if (!respuesta.ok) {
        Alert.alert(
          "No se pudo iniciar sesión",
          datos.detail || datos.mensaje || "Correo o contraseña incorrectos."
        );
        return;
      }

      const token: string = datos.access_token ?? datos.token ?? "";
      if (!token) {
        Alert.alert("Error", "El servidor no entregó la sesión.");
        return;
      }

      const usuario = datos.usuario ?? {};
      const plan = datos.plan ?? datos.membresia?.plan ?? {};
      const rol = String(usuario.rol ?? datos.rol ?? "").toLowerCase();

      const idMembresia = datos.id_membresia ?? datos.membresia?.id_membresia ?? datos.membresia?.id ?? "";
      const estado = String(datos.estado_membresia ?? datos.membresia?.estado ?? "").toLowerCase();
      const fechaFin = datos.fecha_fin ?? datos.membresia?.fecha_fin ?? "";

      try {
        await SecureStore.setItemAsync("access_token", token);
      } catch {}

      const rolNormalizado = rol.trim().toLowerCase();

      // 1. ADMINISTRADOR
      if (rolNormalizado === "administrador" || rolNormalizado === "admin") {
        Alert.alert("¡Bienvenido, administrador!", `Hola ${usuario.nombres ?? ""}.`);
        router.replace({ pathname: "/dashboard", params: { access_token: token } } as any);
        return;
      }

      // 2. ENTRENADOR
      if (rolNormalizado === "entrenador" || rolNormalizado === "trainer") {
        Alert.alert("¡Bienvenido, entrenador!", `Hola ${usuario.nombres ?? "Entrenador"}.`);
        router.replace({
          pathname: "/dashboard_entrenador",
          params: {
            nombre_usuario: usuario.nombres ?? "Entrenador",
            correo_usuario: usuario.correo ?? correo,
            access_token: token,
          },
        } as any);
        return;
      }

      // 3. CLIENTE
      if (datos.acceso_dashboard === true) {
        // Membresía activa -> Dashboard
        router.replace({
          pathname: "/(tabs)/dashboard_usuario",
          params: {
            nombre_usuario: `${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim(),
            correo_usuario: usuario.correo ?? "",
            id_membresia: String(idMembresia),
            nombre_plan: plan.nombre ?? "",
            precio: String(plan.precio ?? ""),
            duracion_dias: String(plan.duracion_dias ?? ""),
            estado_membresia: estado,
            fecha_fin: fechaFin ?? "",
            access_token: token,
            beneficios: JSON.stringify(plan.beneficios ?? []), // <-- AQUÍ SE ENVÍAN LOS BENEFICIOS
          },
        });
        return;
      }

      if (idMembresia) {
        // Membresía pendiente -> Pago
        router.replace({
          pathname: "/pago" as any,
          params: {
            access_token: token,
            nombre_usuario: `${usuario.nombres ?? ""} ${usuario.apellidos ?? ""}`.trim(),
            correo_usuario: usuario.correo ?? "",
            id_membresia: String(idMembresia),
            nombre_plan: plan.nombre ?? "Sin membresía",
            precio: String(plan.precio ?? ""),
            duracion_dias: String(plan.duracion_dias ?? ""),
            estado_membresia: estado || "pendiente",
            fecha_fin: String(fechaFin),
          },
        });
        return;
      }

      // Sin membresía -> Planes
      Alert.alert("Sin membresía", "Por favor selecciona un plan.");
      router.replace("/planes");

    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.volver} onPress={() => router.back()} disabled={cargando}>
          <Text style={styles.textoVolver}>‹ Volver</Text>
        </TouchableOpacity>

        <View style={styles.encabezado}>
          <Text style={styles.logo}>GYMFIT</Text>
          <Text style={styles.subtitulo}>TU ENTRENAMIENTO COMIENZA AQUÍ</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.descripcion}>Ingresa a tu cuenta para continuar.</Text>

          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor="#777777"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!cargando}
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu contraseña"
            placeholderTextColor="#777777"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!cargando}
          />

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDesactivado]}
            onPress={iniciarSesion}
            disabled={cargando}
          >
            {cargando ? <ActivityIndicator color="#111111" /> : <Text style={styles.textoBoton}>INGRESAR</Text>}
          </TouchableOpacity>

          <Text style={styles.nota}>
            Si tu membresía tiene un pago pendiente, podrás consultar su información y continuar con el proceso de pago después de iniciar sesión.
          </Text>

          <TouchableOpacity style={styles.botonVolver} onPress={() => router.replace("/")} disabled={cargando}>
            <Text style={styles.textoSecundario}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#111111" },
  contenido: { flexGrow: 1, padding: 24, justifyContent: "center" },
  volver: { marginBottom: 28, alignSelf: "flex-start" },
  textoVolver: { color: "#CFFF00", fontSize: 16 },
  encabezado: { alignItems: "center", marginBottom: 32 },
  logo: { color: "#CFFF00", fontSize: 36, fontWeight: "900", letterSpacing: 3 },
  subtitulo: { color: "#AAAAAA", fontSize: 10, letterSpacing: 2, marginTop: 8 },
  tarjeta: { backgroundColor: "#1B1B1B", borderRadius: 18, borderWidth: 1, borderColor: "#303030", padding: 24 },
  titulo: { color: "#FFFFFF", fontSize: 27, fontWeight: "bold", marginBottom: 8 },
  descripcion: { color: "#AAAAAA", fontSize: 14, marginBottom: 28 },
  etiqueta: { color: "#FFFFFF", fontSize: 14, fontWeight: "600", marginBottom: 9 },
  input: { backgroundColor: "#111111", borderWidth: 1, borderColor: "#383838", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, color: "#FFFFFF", fontSize: 15, marginBottom: 22 },
  boton: { backgroundColor: "#CFFF00", borderRadius: 10, minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 6 },
  botonDesactivado: { opacity: 0.7 },
  textoBoton: { color: "#111111", fontSize: 16, fontWeight: "900", letterSpacing: 1 },
  nota: { color: "#999999", fontSize: 12, lineHeight: 19, textAlign: "center", marginTop: 22 },
  botonVolver: { alignItems: "center", marginTop: 20 },
  textoSecundario: { color: "#CFFF00", fontSize: 14 },
});