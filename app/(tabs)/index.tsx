
import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { router } from "expo-router";

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
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#111111"
      />

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
            <Text style={styles.subtitle}>
              Tu lugar de transformación
            </Text>
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

        {/* SERVICIOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            NUESTROS SERVICIOS
          </Text>

          <View style={styles.servicesGrid}>
            <Service icon="dumbbell" name="Sala de pesas" />
            <Service icon="run" name="Cardio" />
            <Service icon="boxing-glove" name="Boxeo" />
            <Service icon="meditation" name="Yoga" />
            <Service icon="bike" name="Spinning" />
            <Service icon="account-group" name={"Clases\ngrupales"} />
            <Service icon="food-apple" name="Nutrición" />
            <Service icon="spa" name="Spa & Recovery" />
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
                  <Text style={styles.planName}>
                    {plan.nombre}
                  </Text>

                  <Text style={styles.planDuration}>
                    {plan.duracion}
                  </Text>
                </View>

                <Text style={styles.planPrice}>
                  {plan.precio}
                </Text>
              </View>

              <Text style={styles.planDescription}>
                {plan.descripcion}
              </Text>

              {plan.beneficios.map((beneficio, index) => (
                <View
                  key={`${plan.id}-${index}`}
                  style={styles.benefitRow}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#cfff00"
                  />

                  <Text style={styles.benefitText}>
                    {beneficio}
                  </Text>
                </View>
              ))}

      <TouchableOpacity
  style={styles.planButton}
  onPress={() =>
    router.push({
      pathname: "/registro" as any,
      params: {
        id_plan: String(plan.id),
      },
    })
  }
>
  <Text style={styles.planButtonText}>
    PAGAR AHORA
  </Text>

  <Ionicons
    name="arrow-forward"
    size={18}
    color="#111111"
  />
</TouchableOpacity>
            </View>
          ))}
        </View>

        {/* CONTACTO */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Contacto</Text>

          <ContactRow
            icon="location-outline"
            text="Calle 43 1w-63"
          />

          <ContactRow
            icon="call-outline"
            text="+57 3122159830"
          />

          <ContactRow
            icon="mail-outline"
            text="Gymfit@gmail.com"
          />

          <ContactRow
            icon="time-outline"
            text="Lun–Vie 05:00 – 23:00"
          />
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* MENÚ INFERIOR */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.replace("/")}
        >
          <Ionicons
            name="home"
            size={23}
            color="#cfff00"
          />

          <Text style={styles.menuTextActive}>INICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/planes")}
        >
          <Ionicons
            name="card-outline"
            size={23}
            color="#555555"
          />

          <Text style={styles.menuText}>PLANES</Text>
        </TouchableOpacity>

        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/login")}
        >
          <Ionicons
            name="person-outline"
            size={23}
            color="#555555"
          />

          <Text style={styles.menuText}>INGRESAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* COMPONENTE SERVICIO */
type ServiceProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  name: string;
};

function Service({ icon, name }: ServiceProps) {
  return (
    <View style={styles.serviceCard}>
      <MaterialCommunityIcons
        name={icon}
        size={25}
        color="#cfff00"
      />

      <Text style={styles.serviceText}>{name}</Text>
    </View>
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
      <Ionicons
        name={icon}
        size={17}
        color="#cfff00"
      />

      <Text style={styles.contactText}>{text}</Text>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  hero: {
    height: 260,
    justifyContent: "flex-end",
  },

  heroImage: {
    opacity: 0.75,
  },

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

  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
  },

  subtitle: {
    color: "#999999",
    fontSize: 12,
    marginTop: 4,
  },

  section: {
    paddingHorizontal: 25,
    marginTop: 22,
  },

  description: {
    color: "#b8b8b8",
    fontSize: 13,
    lineHeight: 22,
  },

  sectionTitle: {
    color: "#666666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  serviceCard: {
    width: "23%",
    height: 75,
    backgroundColor: "#181818",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  serviceText: {
    color: "#999999",
    fontSize: 8,
    textAlign: "center",
    marginTop: 7,
  },

  membershipSubtitle: {
    color: "#777777",
    fontSize: 12,
    marginBottom: 12,
  },

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

  planName: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },

  planDuration: {
    color: "#777777",
    fontSize: 11,
    marginTop: 4,
  },

  planPrice: {
    color: "#cfff00",
    fontSize: 20,
    fontWeight: "900",
  },

  planDescription: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
  },

  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },

  benefitText: {
    flex: 1,
    color: "#aaaaaa",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 7,
  },

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

  planButtonText: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "900",
  },

  contactCard: {
    marginHorizontal: 25,
    marginTop: 22,
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 18,
  },

  contactTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  contactText: {
    color: "#999999",
    fontSize: 11,
    marginLeft: 10,
  },

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

  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "25%",
  },

  menuText: {
    color: "#555555",
    fontSize: 8,
    marginTop: 4,
  },

  menuTextActive: {
    color: "#cfff00",
    fontSize: 8,
    marginTop: 4,
    fontWeight: "800",
  },
});
