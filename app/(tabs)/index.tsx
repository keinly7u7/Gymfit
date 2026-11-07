import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Ionicons
} from "@expo/vector-icons";

import { router } from "expo-router";

const { width } = Dimensions.get("window");

// --- DATOS DEL CARRUSEL (ENLACES DE INTERNET) ---
const imagenesCarrusel = [
  { id: "1", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" }, // Máquinas
  { id: "2", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop" }, // Pesas
  { id: "3", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop" }, // Cardio
  { id: "4", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop" }, // Mancuernas
];

const planes = [
  {
    id: 1,
    nombre: "Plan Básico",
    precio: "$50.000",
    duracion: "30 días",
    descripcion: "Para quienes comienzan a entrenar.",
    beneficios: [
      "Consulta de ejercicios",
      "Acceso a rutinas generales",
      "Registro de entrenamientos",
      "Seguimiento básico del progreso",
    ],
  },
  {
    id: 2,
    nombre: "Plan Intermedio",
    precio: "$80.000",
    duracion: "80 días",
    descripcion: "Para quienes buscan orientación y organización.",
    beneficios: [
      "Todo lo incluido en el plan básico",
      "Rutinas estructuradas según el objetivo físico",
      "Asignación de un entrenador",
      "Seguimiento de las rutinas asignadas",
    ],
  },
  {
    id: 3,
    nombre: "Plan Premium",
    precio: "$120.000",
    duracion: "180 días",
    descripcion: "Para quienes desean un seguimiento más personalizado.",
    beneficios: [
      "Todo lo incluido en los planes anteriores",
      "Rutinas personalizadas por un entrenador",
      "Ajustes de las rutinas según la evolución del cliente",
      "Seguimiento más detallado del progreso",
    ],
  },
];

export default function HomeScreen() {
  const [indiceActual, setIndiceActual] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Lógica para que el carrusel pase las imágenes automáticamente
  useEffect(() => {
    const intervalo = setInterval(() => {
      let siguienteIndice = indiceActual + 1;
      if (siguienteIndice >= imagenesCarrusel.length) {
        siguienteIndice = 0; // Vuelve a la primera imagen
      }
      setIndiceActual(siguienteIndice);
      flatListRef.current?.scrollToIndex({ index: siguienteIndice, animated: true });
    }, 3000); // Cambia de imagen cada 3 segundos

    return () => clearInterval(intervalo);
  }, [indiceActual]);

  const onScrollToIndexFailed = (info: any) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* IMAGEN PRINCIPAL */}
        <ImageBackground
          source={require("@/assets/images/gym.jpg")}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay}>
            <Text style={styles.welcome}>BIENVENIDO A</Text>
            <Text style={styles.title}>GymFit</Text>
            <Text style={styles.subtitle}>Tu lugar de transformación</Text>
          </View>
        </ImageBackground>

        {/* DESCRIPCIÓN */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Somos un gimnasio moderno con más de 10 años de
            experiencia formando atletas y transformando vidas.
            Equipamiento de última generación, entrenadores
            certificados y un ambiente motivador.
          </Text>
        </View>

        {/* --- CARRUSEL DE IMÁQUINAS POR LINK --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NUESTRAS MÁQUINAS</Text>
          
          <View style={styles.carruselContainer}>
            <FlatList
              ref={flatListRef}
              data={imagenesCarrusel}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              onScrollToIndexFailed={onScrollToIndexFailed}
              renderItem={({ item }) => (
                <Image 
                  source={{ uri: item.url }} 
                  style={styles.carruselImagen} 
                />
              )}
            />
            {/* Puntitos indicadores */}
            <View style={styles.paginacion}>
              {imagenesCarrusel.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.punto,
                    indiceActual === index && styles.puntoActivo,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* MEMBRESÍAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MEMBRESÍAS</Text>
          <Text style={styles.membershipSubtitle}>
            Elige el plan que mejor se adapte a ti
          </Text>

          {planes.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.nombre}</Text>
                  <Text style={styles.planDuration}>{plan.duracion}</Text>
                </View>
                <Text style={styles.planPrice}>{plan.precio}</Text>
              </View>

              <Text style={styles.planDescription}>{plan.descripcion}</Text>

              {plan.beneficios.map((beneficio, index) => (
                <View key={`${plan.id}-${index}`} style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#cfff00" />
                  <Text style={styles.benefitText}>{beneficio}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.planButton}
                onPress={() =>
                  router.push({
                    pathname: "/registro" as any,
                    params: { id_plan: String(plan.id) },
                  })
                }
              >
                <Text style={styles.planButtonText}>PAGAR AHORA</Text>
                <Ionicons name="arrow-forward" size={18} color="#111111" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* CONTACTO */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contacto</Text>
          <ContactRow icon="location-outline" text="Calle 43 1w-63" />
          <ContactRow icon="call-outline" text="+57 3122159830" />
          <ContactRow icon="mail-outline" text="Gymfit@gmail.com" />
          <ContactRow icon="time-outline" text="Lun–Vie 05:00 – 23:00" />
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* MENÚ INFERIOR */}
      <View style={styles.bottomMenu}>
        

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/planes")}>
          <Ionicons name="card-outline" size={23} color="#555555" />
          <Text style={styles.menuText}>PLANES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/login")}>
          <Ionicons name="person-outline" size={23} color="#555555" />
          <Text style={styles.menuText}>INGRESAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* COMPONENTE CONTACTO */
type ContactRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
};

function ContactRow({ icon, text }: ContactRowProps) {
  return (
    <View style={styles.contactRow}>
      <Ionicons name={icon} size={17} color="#cfff00" />
      <Text style={styles.contactText}>{text}</Text>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111111" },
  scrollContent: { paddingBottom: 20 },
  hero: { height: 260, justifyContent: "flex-end" },
  heroImage: { opacity: 0.75 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 25,
    paddingBottom: 28,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  welcome: {
    color: "#cfff00",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  title: { color: "#ffffff", fontSize: 26, fontWeight: "900" },
  subtitle: { color: "#999999", fontSize: 12, marginTop: 4 },
  section: { paddingHorizontal: 25, marginTop: 22 },
  description: { color: "#b8b8b8", fontSize: 13, lineHeight: 22 },
  sectionTitle: {
    color: "#666666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  
  // --- ESTILOS DEL CARRUSEL ---
  carruselContainer: {
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#181818",
  },
  carruselImagen: {
    width: width - 50,
    height: 200,
    resizeMode: "cover",
  },
  paginacion: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
  },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  puntoActivo: {
    backgroundColor: "#cfff00",
    width: 16,
  },

  membershipSubtitle: { color: "#777777", fontSize: 12, marginBottom: 12 },
  planCard: {
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#242424",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: { color: "#ffffff", fontSize: 17, fontWeight: "800" },
  planDuration: { color: "#777777", fontSize: 11, marginTop: 4 },
  planPrice: { color: "#cfff00", fontSize: 20, fontWeight: "900" },
  planDescription: { color: "#999999", fontSize: 12, lineHeight: 18, marginTop: 15 },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 12 },
  benefitText: { flex: 1, color: "#aaaaaa", fontSize: 11, lineHeight: 17, marginLeft: 7 },
  planButton: {
    backgroundColor: "#cfff00",
    height: 42,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  planButtonText: { color: "#111111", fontSize: 11, fontWeight: "900" },
  contactCard: {
    marginHorizontal: 25,
    marginTop: 22,
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 18,
  },
  contactTitle: { color: "#ffffff", fontSize: 15, fontWeight: "800", marginBottom: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  contactText: { color: "#999999", fontSize: 11, marginLeft: 10 },
  bottomMenu: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#242424",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
  },
  menuItem: { alignItems: "center", justifyContent: "center", width: "25%" },
  menuText: { color: "#555555", fontSize: 8, marginTop: 4 },
  menuTextActive: { color: "#cfff00", fontSize: 8, marginTop: 4, fontWeight: "800" },
});