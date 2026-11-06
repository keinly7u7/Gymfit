import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";

const VERDE = "#E8FF47";
const FONDO = "#0A0A0A";
const TARJETA = "#141414";

export default function CrearEntrenador() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [cargando, setCargando] = useState(false);

  // Función para permitir solo letras (incluye tildes y ñ) y espacios
  const soloLetras = (texto: string) => {
    return texto.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
  };

  // Formatear la fecha automáticamente con guiones (AAAA-MM-DD)
  const formatearFecha = (texto: string) => {
    const digitos = texto.replace(/\D/g, "").slice(0, 8);
    let resultado = digitos;
    if (digitos.length > 4) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 6) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 4) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    }
    setFechaNacimiento(resultado);
  };

  const guardar = async () => {
    // Validaciones de campos vacíos
    if (!nombres || !apellidos || !correo || !telefono || !contrasena || !fechaNacimiento || !numeroDocumento) {
      Alert.alert("Atención", "Completa todos los campos obligatorios.");
      return;
    }

    // Validar que nombres y apellidos no tengan números (doble seguridad)
    const tieneNumeros = /[0-9]/.test(nombres) || /[0-9]/.test(apellidos);
    if (tieneNumeros) {
      Alert.alert("Datos inválidos", "Los nombres y apellidos no pueden contener números.");
      return;
    }

    // Validar formato de correo electrónico básico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(correo)) {
      Alert.alert("Correo inválido", "Por favor ingresa un correo electrónico válido (ejemplo@dominio.com).");
      return;
    }

    // Validar cédula (10 dígitos para CC)
    if (tipoDocumento !== "PASAPORTE" && numeroDocumento.length !== 10) {
      Alert.alert("Documento inválido", "El número de documento debe tener exactamente 10 dígitos.");
      return;
    }

    // Validar edad (mayor de 18 años)
    const hoy = new Date();
    const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
    if (!anio || !mes || !dia) {
      Alert.alert("Fecha inválida", "Ingresa una fecha de nacimiento válida.");
      return;
    }
    const nacimiento = new Date(anio, mes - 1, dia);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    if (edad < 18) {
      Alert.alert("Edad inválida", "El entrenador debe ser mayor de 18 años.");
      return;
    }

    // Validar teléfono (10 dígitos)
    if (telefono.length !== 10) {
      Alert.alert("Teléfono inválido", "El teléfono debe tener exactamente 10 dígitos.");
      return;
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (contrasena.length < 6) {
      Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    const token = await SecureStore.getItemAsync("access_token");
    try {
      const res = await fetch(`${API_URL}/api/admin/crear-entrenador`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombres, apellidos, correo, telefono, contrasena,
          fecha_nacimiento: fechaNacimiento,
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento
        })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("¡Éxito!", "Entrenador creado correctamente.", [
          { text: "Volver", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", data.detail || "No se pudo crear el entrenador.");
      }
    } catch (e) {
      Alert.alert("Error", "Problema de conexión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={VERDE} />
          <Text style={styles.textoVolver}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Crear Entrenador</Text>
        <Text style={styles.subtitulo}>Completa los datos para registrar un nuevo entrenador.</Text>

        <Text style={styles.label}>Nombres *</Text>
        <TextInput 
          style={styles.input} 
          value={nombres} 
          onChangeText={(texto) => setNombres(soloLetras(texto))} 
          placeholder="Nombres" 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Apellidos *</Text>
        <TextInput 
          style={styles.input} 
          value={apellidos} 
          onChangeText={(texto) => setApellidos(soloLetras(texto))} 
          placeholder="Apellidos" 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput 
          style={styles.input} 
          value={correo} 
          onChangeText={setCorreo} 
          placeholder="correo@ejemplo.com" 
          keyboardType="email-address" 
          autoCapitalize="none" 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Teléfono (10 dígitos) *</Text>
        <TextInput 
          style={styles.input} 
          value={telefono} 
          onChangeText={(t) => setTelefono(t.replace(/\D/g, "").slice(0, 10))} 
          placeholder="3001234567" 
          keyboardType="phone-pad" 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput 
          style={styles.input} 
          value={contrasena} 
          onChangeText={setContrasena} 
          placeholder="Mínimo 6 caracteres" 
          secureTextEntry 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Fecha de nacimiento (AAAA-MM-DD) *</Text>
        <TextInput 
          style={styles.input} 
          value={fechaNacimiento} 
          onChangeText={formatearFecha} 
          placeholder="2000-01-01" 
          keyboardType="numeric" 
          placeholderTextColor="#666" 
        />

        <Text style={styles.label}>Tipo de documento *</Text>
        <View style={styles.filaDocs}>
          {["CC", "TI", "CE", "PASAPORTE"].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[styles.chipDoc, tipoDocumento === tipo && styles.chipDocActivo]}
              onPress={() => { setTipoDocumento(tipo); setNumeroDocumento(""); }}
            >
              <Text style={[styles.textoChipDoc, tipoDocumento === tipo && styles.textoChipDocActivo]}>{tipo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Número de documento *</Text>
        <TextInput
          style={styles.input}
          value={numeroDocumento}
          onChangeText={(t) => {
            if (tipoDocumento === "PASAPORTE") {
              setNumeroDocumento(t.slice(0, 15).toUpperCase());
            } else {
              setNumeroDocumento(t.replace(/\D/g, "").slice(0, 10));
            }
          }}
          placeholder={tipoDocumento === "PASAPORTE" ? "Hasta 15 caracteres" : "10 dígitos"}
          keyboardType={tipoDocumento === "PASAPORTE" ? "default" : "numeric"}
          placeholderTextColor="#666"
        />

        <TouchableOpacity style={styles.botonGuardar} onPress={guardar} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#000" /> : <Text style={styles.textoBotonGuardar}>CREAR ENTRENADOR</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: FONDO },
  contenido: { padding: 20 },
  volver: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  textoVolver: { color: VERDE, fontSize: 14, fontWeight: "bold" },
  titulo: { color: "#FFF", fontSize: 26, fontWeight: "900", marginBottom: 5 },
  subtitulo: { color: "#666", fontSize: 13, marginBottom: 20 },
  label: { color: "#888", fontSize: 12, fontWeight: "bold", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: TARJETA, borderRadius: 10, padding: 14, color: "#FFF", borderWidth: 1, borderColor: "#222", fontSize: 14 },
  filaDocs: { flexDirection: "row", gap: 8 },
  chipDoc: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: TARJETA, alignItems: "center", borderWidth: 1, borderColor: "#222" },
  chipDocActivo: { borderColor: VERDE, backgroundColor: `${VERDE}15` },
  textoChipDoc: { color: "#666", fontSize: 11, fontWeight: "bold" },
  textoChipDocActivo: { color: VERDE },
  botonGuardar: { backgroundColor: VERDE, padding: 16, borderRadius: 12, alignItems: "center", marginTop: 25 },
  textoBotonGuardar: { color: "#000", fontSize: 14, fontWeight: "900" }
});