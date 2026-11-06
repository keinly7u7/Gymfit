import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

const EDAD_MINIMA = 15;
const MAX_DIGITOS_DOCUMENTO = 15;
const DIGITOS_TELEFONO = 10;

type Plan = {
  id_plan: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_dias: number;
  beneficios: {
    id_beneficio: number;
    nombre: string;
    detalle: string | null;
  }[];
};

type Objetivo = {
  id_objetivo: number;
  nombre: string;
  descripcion?: string | null;
};

type CampoProps = {
  titulo: string;
  valor: string;
  cambiar: (valor: string) => void;
  placeholder?: string;
  teclado?: "default" | "email-address" | "phone-pad" | "numeric";
  seguro?: boolean;
  multilinea?: boolean;
  soloNumeros?: boolean;
  maxDigitos?: number;
};

function Campo({
  titulo,
  valor,
  cambiar,
  placeholder,
  teclado = "default",
  seguro = false,
  multilinea = false,
  soloNumeros = false,
  maxDigitos,
}: CampoProps) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{titulo}</Text>

      <TextInput
        style={[styles.input, multilinea && styles.textArea]}
        value={valor}
        onChangeText={(texto) => {
          if (soloNumeros) {
            cambiar(
              texto.replace(/\D/g, "").slice(0, maxDigitos ?? undefined)
            );
          } else {
            cambiar(texto);
          }
        }}
        placeholder={placeholder || titulo}
        placeholderTextColor="#858585"
        keyboardType={teclado}
        secureTextEntry={seguro}
        multiline={multilinea}
        autoCapitalize={
          teclado === "email-address" ? "none" : "sentences"
        }
        autoCorrect={teclado !== "email-address"}
      />
    </View>
  );
}

export default function Registro() {
  const params = useLocalSearchParams<{ id_plan?: string }>();

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [sexoGenero, setSexoGenero] = useState("Prefiero no decirlo");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [idObjetivo, setIdObjetivo] = useState<number | null>(null);
  const [idPlan, setIdPlan] = useState<number | null>(null);
  const [nivelExperiencia, setNivelExperiencia] = useState("principiante");
  const [lesiones, setLesiones] = useState("");
  const [contactoNombre, setContactoNombre] = useState("");
  const [contactoTelefono, setContactoTelefono] = useState("");
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");

  useEffect(() => {
    cargarOpciones();
  }, []);

  async function cargarOpciones() {
    setCargandoDatos(true);
    setErrorCarga("");

    try {
      const [respuestaPlanes, respuestaObjetivos] = await Promise.all([
        fetch(`${API_URL}/api/planes`),
        fetch(`${API_URL}/api/objetivos`),
      ]);

      if (!respuestaPlanes.ok || !respuestaObjetivos.ok) {
        throw new Error("No fue posible consultar los planes y objetivos.");
      }

      const datosPlanes: Plan[] = await respuestaPlanes.json();
      const datosObjetivos: Objetivo[] = await respuestaObjetivos.json();

      setPlanes(datosPlanes);
      setObjetivos(datosObjetivos);

      // Selecciona automáticamente el plan recibido desde la pantalla de planes.
      const idPlanRecibido = Number(params.id_plan);

      if (
        params.id_plan &&
        datosPlanes.some((plan) => plan.id_plan === idPlanRecibido)
      ) {
        setIdPlan(idPlanRecibido);
      }
    } catch {
      setErrorCarga(
        "No se pudo conectar con GymFit. Verifica que el backend esté encendido y la URL sea correcta."
      );
    } finally {
      setCargandoDatos(false);
    }
  }

  function formatearFecha(texto: string) {
    const digitos = texto.replace(/\D/g, "").slice(0, 8);
    let resultado = digitos;

    if (digitos.length > 6) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4, 6)}-${digitos.slice(6)}`;
    } else if (digitos.length > 4) {
      resultado = `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
    }

    setFechaNacimiento(resultado);
  }

  function validar(): string | null {
    const nombreLimpio = nombres.trim();
    const apellidoLimpio = apellidos.trim();
    const documentoLimpio = numeroDocumento.trim();
    const correoLimpio = correo.trim();
    const nacimiento = fechaNacimiento.trim();

    if (
      nombreLimpio.length < 2 ||
      nombreLimpio.length > 50 ||
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(nombreLimpio)
    ) {
      return "Ingresa nombres válidos de 2 a 50 caracteres.";
    }

    if (
      apellidoLimpio.length < 2 ||
      apellidoLimpio.length > 50 ||
      !/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/.test(apellidoLimpio)
    ) {
      return "Ingresa apellidos válidos de 2 a 50 caracteres.";
    }

    if (!["CC", "TI", "CE", "PASAPORTE"].includes(tipoDocumento)) {
      return "Selecciona un tipo de documento válido.";
    }

    if (!documentoLimpio) {
      return "Ingresa tu número de documento.";
    }

    if (tipoDocumento === "PASAPORTE") {
      if (!/^[a-zA-Z0-9]{5,15}$/.test(documentoLimpio)) {
        return "El pasaporte debe tener entre 5 y 15 caracteres alfanuméricos.";
      }
    } else if (
      !new RegExp(`^\\d{6,${MAX_DIGITOS_DOCUMENTO}}$`).test(
        documentoLimpio
      )
    ) {
      return `El documento debe contener entre 6 y ${MAX_DIGITOS_DOCUMENTO} dígitos numéricos.`;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento)) {
      return "La fecha debe tener el formato AAAA-MM-DD.";
    }

    const [anio, mes, dia] = nacimiento.split("-").map(Number);
    const hoy = new Date();
    const anioActual = hoy.getFullYear();

    if (anio < 1900 || anio > anioActual) {
      return `El año de nacimiento debe estar entre 1900 y ${anioActual}.`;
    }

    if (mes < 1 || mes > 12) {
      return "El mes de nacimiento no es válido.";
    }

    const fecha = new Date(Date.UTC(anio, mes - 1, dia));

    if (
      fecha.getUTCFullYear() !== anio ||
      fecha.getUTCMonth() !== mes - 1 ||
      fecha.getUTCDate() !== dia
    ) {
      return "La fecha de nacimiento no existe en el calendario.";
    }

    const fechaHoy = new Date(
      Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    );

    if (fecha >= fechaHoy) {
      return "La fecha de nacimiento no puede ser hoy ni futura.";
    }

    let edad = anioActual - anio;

    if (
      hoy.getMonth() + 1 < mes ||
      (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)
    ) {
      edad--;
    }

    if (edad < EDAD_MINIMA) {
      return `Debes tener al menos ${EDAD_MINIMA} años para registrarte.`;
    }

    if (edad > 100) {
      return "Ingresa una fecha de nacimiento válida.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      return "Ingresa un correo electrónico válido.";
    }

    if (!new RegExp(`^\\d{${DIGITOS_TELEFONO}}$`).test(telefono.trim())) {
      return `El teléfono debe contener exactamente ${DIGITOS_TELEFONO} dígitos.`;
    }

    if (contrasena.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!/[A-Z]/.test(contrasena)) {
      return "La contraseña debe incluir una letra mayúscula.";
    }

    if (!/[a-z]/.test(contrasena)) {
      return "La contraseña debe incluir una letra minúscula.";
    }

    if (!/\d/.test(contrasena)) {
      return "La contraseña debe incluir un número.";
    }

    if (contrasena !== confirmarContrasena) {
      return "Las contraseñas no coinciden.";
    }

    if (
      idObjetivo === null ||
      !objetivos.some((objetivo) => objetivo.id_objetivo === idObjetivo)
    ) {
      return "Selecciona un objetivo de entrenamiento.";
    }

    if (
      idPlan === null ||
      !planes.some((plan) => plan.id_plan === idPlan)
    ) {
      return "Selecciona un plan válido.";
    }

    if (
      (contactoNombre.trim() && !contactoTelefono.trim()) ||
      (!contactoNombre.trim() && contactoTelefono.trim())
    ) {
      return "Completa el nombre y el teléfono del contacto de emergencia, o deja ambos vacíos.";
    }

    if (
      contactoTelefono.trim() &&
      !new RegExp(`^\\d{${DIGITOS_TELEFONO}}$`).test(
        contactoTelefono.trim()
      )
    ) {
      return `El teléfono de emergencia debe tener ${DIGITOS_TELEFONO} dígitos.`;
    }

    if (
      !["principiante", "intermedio", "avanzado"].includes(nivelExperiencia)
    ) {
      return "Selecciona un nivel de experiencia válido.";
    }

    if (sexoGenero.length > 40) {
      return "El campo sexo o género no puede superar 40 caracteres.";
    }

    if (lesiones.length > 5000) {
      return "La descripción de lesiones o condiciones es demasiado larga.";
    }

    if (!aceptoTerminos) {
      return "Debes aceptar los términos y el tratamiento de datos personales.";
    }

    return null;
  }

  async function registrar() {
    const error = validar();

    if (error) {
      Alert.alert("Revisa el formulario", error);
      return;
    }

    setEnviando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/registro`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          tipo_documento: tipoDocumento,
          numero_documento: numeroDocumento.trim(),
          fecha_nacimiento: fechaNacimiento.trim(),
          sexo_genero: sexoGenero || null,
          correo: correo.trim().toLowerCase(),
          telefono: telefono.trim(),
          contrasena,
          confirmar_contrasena: confirmarContrasena,
          id_objetivo: idObjetivo,
          id_plan: idPlan,
          nivel_experiencia: nivelExperiencia,
          lesiones_condiciones: lesiones.trim() || null,
          contacto_emergencia_nombre: contactoNombre.trim() || null,
          contacto_emergencia_telefono: contactoTelefono.trim() || null,
          acepto_terminos: aceptoTerminos,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        const mensaje =
          typeof resultado.detail === "string"
            ? resultado.detail
            : typeof resultado.mensaje === "string"
              ? resultado.mensaje
              : "No se pudo completar el registro. Revisa los datos.";

        Alert.alert("No se pudo registrar", mensaje);
        return;
      }

      // ¡EL CAMBIO CLAVE! Redirigir al login en vez de al pago.
      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada correctamente. Ahora inicia sesión para acceder.",
        [
          {
            text: "Ir a iniciar sesión",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch {
      Alert.alert(
        "Error de conexión",
        "No fue posible conectar con GymFit. Verifica tu conexión e inténtalo nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  function opcion(
    texto: string,
    seleccionada: boolean,
    alSeleccionar: () => void
  ) {
    return (
      <TouchableOpacity
        key={texto}
        style={[styles.opcion, seleccionada && styles.opcionActiva]}
        onPress={alSeleccionar}
        accessibilityRole="button"
        accessibilityState={{ selected: seleccionada }}
      >
        <Text
          style={[
            styles.textoOpcion,
            seleccionada && styles.textoOpcionActivo,
          ]}
        >
          {texto}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.volver}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVolver}>‹ Volver</Text>
        </TouchableOpacity>

        <Text style={styles.marca}>GYMFIT</Text>
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>
          Regístrate y elige el plan que se adapte a tus objetivos.
        </Text>

        <Text style={styles.seccion}>1. Datos personales</Text>

        <Campo titulo="Nombres *" valor={nombres} cambiar={setNombres} />
        <Campo titulo="Apellidos *" valor={apellidos} cambiar={setApellidos} />

        <Text style={styles.etiqueta}>Tipo de documento *</Text>
        <View style={styles.opciones}>
          {["CC", "TI", "CE", "PASAPORTE"].map((tipo) =>
            opcion(tipo, tipoDocumento === tipo, () => {
              setTipoDocumento(tipo);
              setNumeroDocumento("");
            })
          )}
        </View>

        <Campo
          titulo="Número de documento *"
          valor={numeroDocumento}
          cambiar={setNumeroDocumento}
          teclado={tipoDocumento === "PASAPORTE" ? "default" : "numeric"}
          soloNumeros={tipoDocumento !== "PASAPORTE"}
          maxDigitos={MAX_DIGITOS_DOCUMENTO}
        />
        <Text style={styles.ayuda}>
          {tipoDocumento === "PASAPORTE"
            ? "Entre 5 y 15 caracteres (letras y números)."
            : `Solo números, entre 6 y ${MAX_DIGITOS_DOCUMENTO} dígitos.`}
        </Text>

        <Campo
          titulo="Fecha de nacimiento *"
          valor={fechaNacimiento}
          cambiar={formatearFecha}
          placeholder="AAAA-MM-DD"
          teclado="numeric"
        />
        <Text style={styles.ayuda}>
          Debes tener al menos {EDAD_MINIMA} años. Escribe solo los números y
          los guiones se agregan solos.
        </Text>

        <Text style={styles.etiqueta}>Sexo o género (opcional)</Text>
        <View style={styles.opciones}>
          {["Femenino", "Masculino", "Otro", "Prefiero no decirlo"].map(
            (valor) =>
              opcion(valor, sexoGenero === valor, () =>
                setSexoGenero(valor)
              )
          )}
        </View>

        <Text style={styles.seccion}>2. Datos de acceso</Text>

        <Campo
          titulo="Correo electrónico *"
          valor={correo}
          cambiar={setCorreo}
          teclado="email-address"
        />
        <Campo
          titulo="Teléfono de 10 dígitos *"
          valor={telefono}
          cambiar={setTelefono}
          teclado="phone-pad"
          soloNumeros
          maxDigitos={DIGITOS_TELEFONO}
        />
        <Campo
          titulo="Contraseña *"
          valor={contrasena}
          cambiar={setContrasena}
          seguro
        />
        <Text style={styles.ayuda}>
          Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
        </Text>
        <Campo
          titulo="Confirmar contraseña *"
          valor={confirmarContrasena}
          cambiar={setConfirmarContrasena}
          seguro
        />

        <Text style={styles.seccion}>3. Información de entrenamiento</Text>

        <Text style={styles.etiqueta}>Objetivo físico *</Text>
        {cargandoDatos ? (
          <ActivityIndicator color="#8ee000" />
        ) : (
          <View style={styles.listaOpciones}>
            {objetivos.map((objetivo) =>
              opcion(
                objetivo.nombre,
                idObjetivo === objetivo.id_objetivo,
                () => setIdObjetivo(objetivo.id_objetivo)
              )
            )}
          </View>
        )}

        <Text style={styles.etiqueta}>Nivel de experiencia *</Text>
        <View style={styles.opciones}>
          {["principiante", "intermedio", "avanzado"].map((nivel) =>
            opcion(nivel, nivelExperiencia === nivel, () =>
              setNivelExperiencia(nivel)
            )
          )}
        </View>

        <Campo
          titulo="Lesiones o condiciones (opcional)"
          valor={lesiones}
          cambiar={setLesiones}
          multilinea
          placeholder="Describe alguna lesión o condición relevante"
        />

        <Text style={styles.seccion}>4. Selecciona tu membresía</Text>
        <Text style={styles.ayuda}>
          Básico: 30 días · Intermedio: 90 días · Premium: 180 días.
          Consulta los beneficios y el precio antes de elegir.
        </Text>

        {cargandoDatos ? (
          <ActivityIndicator color="#8ee000" />
        ) : (
          planes.map((plan) => (
            <TouchableOpacity
              key={plan.id_plan}
              style={[
                styles.tarjetaPlan,
                idPlan === plan.id_plan && styles.planSeleccionado,
              ]}
              onPress={() => setIdPlan(plan.id_plan)}
              accessibilityRole="button"
              accessibilityState={{ selected: idPlan === plan.id_plan }}
            >
              <View style={styles.filaPlan}>
                <Text style={styles.nombrePlan}>{plan.nombre}</Text>
                <Text style={styles.precio}>
                  ${Number(plan.precio).toLocaleString("es-CO")} COP
                </Text>
              </View>

              <Text style={styles.detallePlan}>
                {plan.duracion_dias} días de duración
              </Text>

              {!!plan.descripcion && (
                <Text style={styles.detallePlan}>{plan.descripcion}</Text>
              )}

              <Text style={styles.etiquetaBeneficios}>
                Beneficios incluidos
              </Text>

              {plan.beneficios?.length > 0 ? (
                plan.beneficios.map((beneficio) => (
                  <Text
                    key={beneficio.id_beneficio}
                    style={styles.beneficio}
                  >
                    • {beneficio.nombre}
                    {beneficio.detalle ? `: ${beneficio.detalle}` : ""}
                  </Text>
                ))
              ) : (
                <Text style={styles.detallePlan}>
                  Beneficios pendientes de configurar.
                </Text>
              )}

              <Text style={styles.seleccionPlan}>
                {idPlan === plan.id_plan
                  ? "✓ Plan seleccionado"
                  : "Seleccionar plan"}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.seccion}>5. Contacto de emergencia</Text>

        <Campo
          titulo="Nombre del contacto (opcional)"
          valor={contactoNombre}
          cambiar={setContactoNombre}
        />
        <Campo
          titulo="Teléfono del contacto (opcional)"
          valor={contactoTelefono}
          cambiar={setContactoTelefono}
          teclado="phone-pad"
          soloNumeros
          maxDigitos={DIGITOS_TELEFONO}
        />
        <Text style={styles.ayuda}>
          Si completas uno de estos campos, debes completar ambos.
        </Text>

        <TouchableOpacity
          style={styles.filaTerminos}
          onPress={() => setAceptoTerminos(!aceptoTerminos)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: aceptoTerminos }}
        >
          <View
            style={[
              styles.checkbox,
              aceptoTerminos && styles.checkboxActivo,
            ]}
          >
            {aceptoTerminos && <Text style={styles.marcaCheckbox}>✓</Text>}
          </View>
          <Text style={styles.textoTerminos}>
            Acepto los términos y condiciones y autorizo el tratamiento de mis
            datos personales. *
          </Text>
        </TouchableOpacity>

        {!!errorCarga && (
          <View style={styles.errorCaja}>
            <Text style={styles.errorTexto}>{errorCarga}</Text>
            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={cargarOpciones}
            >
              <Text style={styles.textoBoton}>Reintentar carga</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.botonRegistro,
            (enviando || cargandoDatos || !!errorCarga) &&
              styles.botonDeshabilitado,
          ]}
          onPress={registrar}
          disabled={enviando || cargandoDatos || !!errorCarga}
        >
          {enviando ? (
            <ActivityIndicator color="#101010" />
          ) : (
            <Text style={styles.textoBotonRegistro}>CREAR CUENTA</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.pie}>
          * Campos obligatorios. La membresía se registrará como pendiente de
          pago. El pago es una demostración y no realiza cobros reales.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#101010",
  },
  contenido: {
    padding: 22,
    paddingBottom: 45,
  },
  volver: {
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 15,
  },
  textoVolver: {
    color: "#a8f33c",
    fontSize: 15,
  },
  marca: {
    color: "#8ee000",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 10,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitulo: {
    color: "#bdbdbd",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  seccion: {
    color: "#8ee000",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 14,
  },
  campo: {
    marginBottom: 14,
  },
  etiqueta: {
    color: "#f0f0f0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 5,
  },
  input: {
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 10,
    color: "#ffffff",
    minHeight: 49,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 95,
    textAlignVertical: "top",
  },
  ayuda: {
    color: "#a7a7a7",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
    marginTop: -4,
  },
  opciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  listaOpciones: {
    gap: 8,
    marginBottom: 15,
  },
  opcion: {
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  opcionActiva: {
    borderColor: "#8ee000",
    backgroundColor: "#26320f",
  },
  textoOpcion: {
    color: "#dddddd",
    fontSize: 13,
  },
  textoOpcionActivo: {
    color: "#a8f33c",
    fontWeight: "700",
  },
  tarjetaPlan: {
    backgroundColor: "#1b1b1b",
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 13,
    padding: 16,
    marginBottom: 13,
  },
  planSeleccionado: {
    borderColor: "#8ee000",
    borderWidth: 2,
    backgroundColor: "#1d2614",
  },
  filaPlan: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  nombrePlan: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
  },
  precio: {
    color: "#a8f33c",
    fontSize: 16,
    fontWeight: "800",
    flexShrink: 1,
    textAlign: "right",
  },
  detallePlan: {
    color: "#c4c4c4",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  etiquetaBeneficios: {
    color: "#ffffff",
    fontWeight: "700",
    marginTop: 13,
    marginBottom: 5,
  },
  beneficio: {
    color: "#d4d4d4",
    fontSize: 13,
    lineHeight: 20,
  },
  seleccionPlan: {
    color: "#a8f33c",
    fontWeight: "700",
    marginTop: 12,
  },
  filaTerminos: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 24,
    marginBottom: 20,
  },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#8ee000",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActivo: {
    backgroundColor: "#8ee000",
  },
  marcaCheckbox: {
    color: "#101010",
    fontWeight: "900",
  },
  textoTerminos: {
    flex: 1,
    color: "#dedede",
    fontSize: 13,
    lineHeight: 20,
  },
  botonRegistro: {
    backgroundColor: "#8ee000",
    borderRadius: 11,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  textoBotonRegistro: {
    color: "#101010",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  pie: {
    color: "#969696",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 17,
  },
  errorCaja: {
    backgroundColor: "#351c1c",
    borderRadius: 10,
    padding: 13,
    marginBottom: 15,
  },
  errorTexto: {
    color: "#ffbaba",
    fontSize: 13,
    lineHeight: 19,
  },
  botonReintentar: {
    alignSelf: "flex-start",
    paddingVertical: 10,
  },
  textoBoton: {
    color: "#a8f33c",
    fontWeight: "700",
  },
});