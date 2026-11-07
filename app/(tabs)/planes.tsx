
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { API_URL } from "../../constants/api";


type Beneficio = {
  id_beneficio: number;
  nombre: string;
  detalle?: string | null;
};

type Plan = {
  id_plan: number;
  nombre: string;
  precio: number;
  duracion_dias: number;
  descripcion?: string | null;
  beneficios: Beneficio[];
};

export default function PlanesScreen() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const cargarPlanes = useCallback(async (esActualizacion = false) => {
    try {
      if (esActualizacion) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const respuesta = await fetch(`${API_URL}/api/planes`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los planes.");
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("El servidor devolvió un formato inesperado.");
      }

      setPlanes(datos);
    } catch (e) {
      setError(
        "No fue posible cargar los planes. Verifica que el backend esté funcionando y que la dirección IP sea correcta."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarPlanes();
  }, [cargarPlanes]);

  const formatearPrecio = (precio: number) => {
    return `$${Number(precio).toLocaleString("es-CO")} COP`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarPlanes(true)}
            tintColor="#B6FF00"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color="#B6FF00" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.brand}>GYMFIT</Text>
            <Text style={styles.headerTitle}>Nuestros planes</Text>
            <Text style={styles.headerSubtitle}>
              Consulta las membresías, precios y beneficios disponibles.
            </Text>
          </View>
        </View>

        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={23}
            color="#B6FF00"
          />
          <Text style={styles.infoText}>
            Aquí puedes consultar los planes disponibles y comparar sus
            beneficios.
          </Text>
        </View>

        {cargando ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#B6FF00" />
            <Text style={styles.loadingText}>Cargando planes...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageCard}>
            <Ionicons
              name="cloud-offline-outline"
              size={42}
              color="#FF6868"
            />
            <Text style={styles.messageTitle}>
              No se pudieron cargar los planes
            </Text>
            <Text style={styles.messageText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => cargarPlanes()}
            >
              <Text style={styles.retryButtonText}>INTENTAR DE NUEVO</Text>
            </TouchableOpacity>
          </View>
        ) : planes.length === 0 ? (
          <View style={styles.messageCard}>
            <Ionicons
              name="barbell-outline"
              size={42}
              color="#B6FF00"
            />
            <Text style={styles.messageTitle}>
              No hay planes disponibles
            </Text>
            <Text style={styles.messageText}>
              Actualmente no hay planes registrados para consultar.
            </Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            <Text style={styles.sectionTitle}>
              PLANES DISPONIBLES ({planes.length})
            </Text>

            {planes.map((plan) => (
              <View key={plan.id_plan} style={styles.planCard}>
                <View style={styles.planHeader}>
                  <View style={styles.planIcon}>
                    <Ionicons
                      name="barbell-outline"
                      size={26}
                      color="#B6FF00"
                    />
                  </View>

                  <View style={styles.planNameContainer}>
                    <Text style={styles.planName}>{plan.nombre}</Text>
                    <Text style={styles.planDuration}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color="#A0A0A0"
                      />{" "}
                      {plan.duracion_dias} días de duración
                    </Text>
                  </View>
                </View>

                {plan.descripcion ? (
                  <Text style={styles.planDescription}>
                    {plan.descripcion}
                  </Text>
                ) : null}

                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>PRECIO DE LA MEMBRESÍA</Text>
                  <Text style={styles.planPrice}>
                    {formatearPrecio(plan.precio)}
                  </Text>
                  <Text style={styles.priceDuration}>
                    Por {plan.duracion_dias} días
                  </Text>
                </View>

                <View style={styles.benefitsContainer}>
                  <Text style={styles.benefitsTitle}>
                    BENEFICIOS INCLUIDOS
                  </Text>

                  {plan.beneficios && plan.beneficios.length > 0 ? (
                    plan.beneficios.map((beneficio) => (
                      <View
                        key={beneficio.id_beneficio}
                        style={styles.benefitRow}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color="#B6FF00"
                        />

                        <View style={styles.benefitTextContainer}>
                          <Text style={styles.benefitName}>
                            {beneficio.nombre}
                          </Text>

                          {beneficio.detalle ? (
                            <Text style={styles.benefitDetail}>
                              {beneficio.detalle}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noBenefits}>
                      Este plan no tiene beneficios registrados.
                    </Text>
                  )}
                </View>

                <View style={styles.availableLabel}>
                  <Ionicons
                    name="eye-outline"
                    size={18}
                    color="#B6FF00"
                  />
                  <Text style={styles.availableLabelText}>
                    PLAN DISPONIBLE PARA CONSULTA
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back-outline" size={19} color="#111111" />
          <Text style={styles.homeButtonText}>VOLVER</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          GYMFIT · TU ENTRENAMIENTO, TU PROGRESO
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    color: "#B6FF00",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 6,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#A0A0A0",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D2410",
    borderWidth: 1,
    borderColor: "#354318",
    borderRadius: 14,
    padding: 15,
    marginBottom: 28,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: "#D6D6D6",
    fontSize: 13,
    lineHeight: 20,
  },
  centerContent: {
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#A0A0A0",
    marginTop: 15,
    fontSize: 14,
  },
  messageCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#303030",
    padding: 25,
    alignItems: "center",
    marginTop: 10,
  },
  messageTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 15,
  },
  messageText: {
    color: "#A0A0A0",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: "#B6FF00",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "900",
  },
  plansContainer: {
    gap: 18,
  },
  sectionTitle: {
    color: "#B6FF00",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  planCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 20,
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  planIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#262D16",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  planNameContainer: {
    flex: 1,
  },
  planName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
  },
  planDuration: {
    color: "#A0A0A0",
    fontSize: 13,
    marginTop: 6,
  },
  planDescription: {
    color: "#B5B5B5",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  priceContainer: {
    backgroundColor: "#222222",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
  },
  priceLabel: {
    color: "#A0A0A0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  planPrice: {
    color: "#B6FF00",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 7,
  },
  priceDuration: {
    color: "#A0A0A0",
    fontSize: 12,
    marginTop: 4,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 15,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 13,
    gap: 10,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitName: {
    color: "#E6E6E6",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  benefitDetail: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  noBenefits: {
    color: "#A0A0A0",
    fontSize: 13,
  },
  availableLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#262D16",
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 8,
    gap: 8,
  },
  availableLabelText: {
    color: "#B6FF00",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B6FF00",
    borderRadius: 13,
    paddingVertical: 16,
    marginTop: 28,
    gap: 9,
  },
  homeButtonText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  footer: {
    color: "#656565",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 25,
  },
});
