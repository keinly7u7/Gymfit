
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Usa aquí la misma URL del backend que utilizas en el login.
import { API_URL } from "../constants/api";


export default function PagoScreen() {
  const params = useLocalSearchParams<{
    nombre_usuario?: string;
    correo_usuario?: string;
    id_membresia?: string;
    nombre_plan?: string;
    precio?: string;
    duracion_dias?: string;
    estado_membresia?: string;
    fecha_fin?: string;
    access_token?: string;
  }>();

  const [procesando, setProcesando] = useState(false);

  const nombrePlan = params.nombre_plan || "Sin membresía";

  const precioPlan = params.precio
    ? `$${Number(params.precio).toLocaleString("es-CO")}`
    : "Por consultar";

  const duracion = params.duracion_dias
    ? `${params.duracion_dias} días`
    : "Por confirmar";

  const simularPago = async () => {
    if (procesando) return;

    if (!params.id_membresia || !params.access_token) {
      Alert.alert(
        "Faltan datos",
        "No se encontró la membresía o la sesión. Cierra sesión e inicia sesión nuevamente."
      );
      return;
    }

    const idMembresia = Number(params.id_membresia);

    if (!Number.isInteger(idMembresia) || idMembresia <= 0) {
      Alert.alert("Error", "El número de membresía no es válido.");
      return;
    }

    setProcesando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/pagos/simulado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${params.access_token}`,
        },
        body: JSON.stringify({
          id_membresia: idMembresia,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.detail || "No fue posible procesar el pago."
        );
      }

      if (
        resultado.pago_aprobado !== true ||
        resultado.acceso_dashboard !== true
      ) {
        Alert.alert(
          "Acceso no disponible",
          resultado.mensaje ||
            "El pago no habilitó el acceso. Verifica el estado de tu membresía."
        );
        return;
      }

      Alert.alert(
        "Pago aprobado",
        "El pago de demostración se registró correctamente y tu membresía está activa.",
        [
          {
            text: "Entrar al dashboard",
            onPress: () => {
              router.replace({
                pathname: "/dashboard_usuario" as any,
                params: {
                  nombre_usuario: params.nombre_usuario ?? "",
                  correo_usuario: params.correo_usuario ?? "",
                  id_membresia: String(
                    resultado.id_membresia ?? idMembresia
                  ),
                  nombre_plan: params.nombre_plan ?? "",
                  precio: params.precio ?? "",
                  duracion_dias: params.duracion_dias ?? "",
                  estado_membresia: "activa",
                  fecha_fin: params.fecha_fin ?? "",
                },
              });
            },
          },
        ]
      );
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servidor.";

      Alert.alert(
        "Error al procesar el pago",
        `${mensaje}\n\nVerifica que el backend esté encendido y que la URL de la API sea correcta.`
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={procesando}
        >
          <Ionicons name="arrow-back" size={22} color="#CFFF00" />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>GYMFIT</Text>
          <Text style={styles.subtitle}>RESUMEN DE MEMBRESÍA</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="card-outline" size={38} color="#CFFF00" />
          </View>

          <Text style={styles.title}>Resumen de tu membresía</Text>

          <Text style={styles.description}>
            Revisa la información de tu membresía antes de continuar.
          </Text>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Titular</Text>
            <Text style={styles.value}>
              {params.nombre_usuario || "No disponible"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>
              {params.correo_usuario || "No disponible"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{nombrePlan}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Duración</Text>
            <Text style={styles.value}>{duracion}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Número de membresía</Text>
            <Text style={styles.value}>
              {params.id_membresia || "No disponible"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado actual</Text>
            <Text style={styles.pending}>
              {params.estado_membresia || "Pendiente"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de vencimiento</Text>
            <Text style={styles.value}>
              {params.fecha_fin || "No disponible"}
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.totalLabel}>Total de demostración</Text>
          <Text style={styles.total}>{precioPlan}</Text>

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#CFFF00"
            />
            <Text style={styles.noticeText}>
              Pago simulado para pruebas. No se realiza ningún cobro real.
              La aprobación se registra en la base de datos.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.payButton,
              procesando && styles.disabledButton,
            ]}
            onPress={simularPago}
            disabled={procesando}
            activeOpacity={0.8}
          >
            {procesando ? (
              <>
                <ActivityIndicator color="#111111" />
                <Text style={styles.payButtonText}>PROCESANDO...</Text>
              </>
            ) : (
              <>
                <Text style={styles.payButtonText}>
                  CONFIRMAR PAGO SIMULADO
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#111111"
                />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace("/")}
            disabled={procesando}
          >
            <Text style={styles.homeButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  content: {
    flexGrow: 1,
    padding: 22,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 25,
    gap: 8,
  },
  backText: {
    color: "#CFFF00",
    fontSize: 15,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  logo: {
    color: "#CFFF00",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#999999",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 7,
  },
  card: {
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#303030",
    padding: 22,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#292E16",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: "#999999",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#353535",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginVertical: 9,
  },
  label: {
    color: "#999999",
    fontSize: 13,
    flex: 1,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  pending: {
    color: "#F0C75E",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
    textAlign: "right",
    flex: 1,
  },
  totalLabel: {
    color: "#AAAAAA",
    fontSize: 14,
    textAlign: "center",
  },
  total: {
    color: "#CFFF00",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 8,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#292E16",
    borderRadius: 10,
    padding: 12,
    gap: 9,
    marginTop: 22,
    marginBottom: 20,
  },
  noticeText: {
    color: "#D0D0D0",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  payButton: {
    minHeight: 52,
    backgroundColor: "#CFFF00",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
  homeButton: {
    alignItems: "center",
    marginTop: 20,
    padding: 8,
  },
  homeButtonText: {
    color: "#AAAAAA",
    fontSize: 13,
  },
});
