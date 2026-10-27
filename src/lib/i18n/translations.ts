export type Language = "es" | "en";

export interface Translations {
  nav: {
    home: string;
    spaces: string;
    dashboard: string;
    admin: string;
    login: string;
    register: string;
    logout: string;
    greeting: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    exploreBtn: string;
    featuresTitle: string;
    desksTitle: string;
    desksDesc: string;
    roomsTitle: string;
    roomsDesc: string;
    boothsTitle: string;
    boothsDesc: string;
  };
  spaces: {
    catalogTitle: string;
    catalogSubtitle: string;
    allTypes: string;
    desk: string;
    meetingRoom: string;
    booth: string;
    capacity: string;
    pricePerHour: string;
    viewDetails: string;
    noSpaces: string;
  };
  spaceDetail: {
    backToCatalog: string;
    type: string;
    capacity: string;
    pricePerHour: string;
    reserveTitle: string;
    date: string;
    startHour: string;
    duration: string;
    totalPrice: string;
    confirmBooking: string;
    mustLoginToReserve: string;
    bookingSuccess: string;
    hoursOption: string;
    hoursRangeNote: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    noBookings: string;
    exploreSpaces: string;
    statusConfirmed: string;
    statusCancelled: string;
    cancelBtn: string;
    cancelConfirm: string;
    cancelSuccess: string;
    cannotCancelNote: string;
    spaceLabel: string;
    dateLabel: string;
    hoursLabel: string;
    totalLabel: string;
  };
  admin: {
    title: string;
    subtitle: string;
    createNewSpace: string;
    name: string;
    description: string;
    type: string;
    capacity: string;
    price: string;
    imageUrl: string;
    createBtn: string;
    existingSpaces: string;
    deactivateBtn: string;
    deactivateConfirm: string;
    activeStatus: string;
    inactiveStatus: string;
    createSuccess: string;
    deactivateSuccess: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    loginBtn: string;
    registerBtn: string;
    noAccount: string;
    hasAccount: string;
    loginSuccess: string;
    registerSuccess: string;
  };
  clock: {
    localTimeTitle: string;
    bogotaNotice: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    nav: {
      home: "Inicio",
      spaces: "Espacios",
      dashboard: "Mis Reservas",
      admin: "Panel Admin",
      login: "Iniciar Sesión",
      register: "Registrarse",
      logout: "Cerrar Sesión",
      greeting: "Hola",
    },
    home: {
      heroTitle: "Tu espacio de coworking ideal, sin complicaciones.",
      heroSubtitle: "Conecta, reserva y produce.",
      exploreBtn: "Explorar Espacios",
      featuresTitle: "Espacios diseñados para tu productividad",
      desksTitle: "Escritorios Flexibles",
      desksDesc: "Puestos individuales con monitores y alta conectividad en ambiente profesional.",
      roomsTitle: "Salas de Juntas",
      roomsDesc: "Equipadas con pantallas interactivas para reuniones de equipo y conferencias.",
      boothsTitle: "Cabinas Acústicas",
      boothsDesc: "Aislamiento de sonido de primera categoría para llamadas y trabajo enfocado.",
    },
    spaces: {
      catalogTitle: "Catálogo de Espacios",
      catalogSubtitle: "Encuentra el espacio perfecto para tu jornada según tus requerimientos.",
      allTypes: "Todos",
      desk: "Escritorio",
      meetingRoom: "Sala de Juntas",
      booth: "Cabina",
      capacity: "personas",
      pricePerHour: "por hora",
      viewDetails: "Ver Detalle y Reservar",
      noSpaces: "No hay espacios disponibles en esta categoría actualmente.",
    },
    spaceDetail: {
      backToCatalog: "← Volver al catálogo",
      type: "Tipo de espacio",
      capacity: "Capacidad máxima",
      pricePerHour: "Tarifa",
      reserveTitle: "Reserva este espacio",
      date: "Fecha de reserva",
      startHour: "Hora de inicio",
      duration: "Duración en horas",
      totalPrice: "Precio total",
      confirmBooking: "Confirmar Reserva",
      mustLoginToReserve: "Inicia sesión con tu cuenta para poder reservar este espacio.",
      bookingSuccess: "¡Reserva confirmada con éxito!",
      hoursOption: "horas",
      hoursRangeNote: "Horario de operación: 7:00 AM a 9:00 PM (hora Colombia).",
    },
    dashboard: {
      title: "Mis Reservas",
      subtitle: "Gestiona tu historial de reservas y cancela con al menos 2 horas de anticipación.",
      noBookings: "Aún no tienes reservas registradas.",
      exploreSpaces: "Explorar catálogo para reservar",
      statusConfirmed: "Confirmada",
      statusCancelled: "Cancelada",
      cancelBtn: "Cancelar Reserva",
      cancelConfirm: "¿Seguro que deseas cancelar esta reserva?",
      cancelSuccess: "Reserva cancelada correctamente.",
      cannotCancelNote: "No cancelable (menos de 2 horas para el inicio).",
      spaceLabel: "Espacio",
      dateLabel: "Fecha",
      hoursLabel: "Horario",
      totalLabel: "Total pagado",
    },
    admin: {
      title: "Panel de Administración",
      subtitle: "Gestión centralizada del catálogo de espacios de CoSpace.",
      createNewSpace: "Crear Nuevo Espacio",
      name: "Nombre del espacio",
      description: "Descripción detallada",
      type: "Tipo",
      capacity: "Capacidad",
      price: "Precio por hora (USD)",
      imageUrl: "URL de la imagen",
      createBtn: "Crear Espacio",
      existingSpaces: "Catálogo de Espacios Existentes",
      deactivateBtn: "Desactivar Espacio",
      deactivateConfirm: "¿Estás seguro de desactivar este espacio? No se admitirá si tiene reservas futuras.",
      activeStatus: "Activo",
      inactiveStatus: "Desactivado",
      createSuccess: "Espacio creado exitosamente.",
      deactivateSuccess: "Espacio desactivado exitosamente.",
    },
    auth: {
      loginTitle: "Bienvenido de nuevo",
      loginSubtitle: "Inicia sesión para gestionar y reservar tus espacios.",
      registerTitle: "Crear una cuenta",
      registerSubtitle: "Regístrate en CoSpace para comenzar a reservar por horas.",
      nameLabel: "Nombre completo",
      emailLabel: "Correo electrónico",
      passwordLabel: "Contraseña",
      loginBtn: "Ingresar",
      registerBtn: "Crear Cuenta",
      noAccount: "¿No tienes cuenta? Regístrate aquí",
      hasAccount: "¿Ya tienes cuenta? Inicia sesión aquí",
      loginSuccess: "Sesión iniciada con éxito.",
      registerSuccess: "Registro completado con éxito.",
    },
    clock: {
      localTimeTitle: "Tu hora local",
      bogotaNotice: "El sistema opera en horario oficial de Bogotá (UTC-5)",
    },
  },
  en: {
    nav: {
      home: "Home",
      spaces: "Spaces",
      dashboard: "My Bookings",
      admin: "Admin Panel",
      login: "Log In",
      register: "Sign Up",
      logout: "Log Out",
      greeting: "Hello",
    },
    home: {
      heroTitle: "Your ideal coworking space, hassle-free.",
      heroSubtitle: "Connect, book and produce.",
      exploreBtn: "Explore Spaces",
      featuresTitle: "Spaces tailored for productivity",
      desksTitle: "Flexible Desks",
      desksDesc: "Individual spots with 4K monitors and high-speed connectivity in a professional vibe.",
      roomsTitle: "Meeting Rooms",
      roomsDesc: "Equipped with interactive screens for team brainstorming and client presentations.",
      boothsTitle: "Acoustic Booths",
      boothsDesc: "Top-tier acoustic isolation for clear video calls and focused work.",
    },
    spaces: {
      catalogTitle: "Spaces Catalog",
      catalogSubtitle: "Find the workspace that matches your schedule and requirements.",
      allTypes: "All",
      desk: "Desk",
      meetingRoom: "Meeting Room",
      booth: "Booth",
      capacity: "people",
      pricePerHour: "per hour",
      viewDetails: "View Details & Book",
      noSpaces: "No spaces available in this category at the moment.",
    },
    spaceDetail: {
      backToCatalog: "← Back to catalog",
      type: "Space type",
      capacity: "Capacity",
      pricePerHour: "Hourly rate",
      reserveTitle: "Book this space",
      date: "Date",
      startHour: "Start time",
      duration: "Duration (hours)",
      totalPrice: "Total price",
      confirmBooking: "Confirm Booking",
      mustLoginToReserve: "Please log in to your account to book this space.",
      bookingSuccess: "Booking confirmed successfully!",
      hoursOption: "hours",
      hoursRangeNote: "Operating hours: 7:00 AM to 9:00 PM (Bogotá time).",
    },
    dashboard: {
      title: "My Bookings",
      subtitle: "Manage your reservations and cancel with at least 2 hours advance notice.",
      noBookings: "You don't have any bookings yet.",
      exploreSpaces: "Browse spaces to book",
      statusConfirmed: "Confirmed",
      statusCancelled: "Cancelled",
      cancelBtn: "Cancel Booking",
      cancelConfirm: "Are you sure you want to cancel this booking?",
      cancelSuccess: "Booking cancelled successfully.",
      cannotCancelNote: "Cannot cancel (less than 2 hours before start).",
      spaceLabel: "Space",
      dateLabel: "Date",
      hoursLabel: "Time",
      totalLabel: "Total paid",
    },
    admin: {
      title: "Admin Dashboard",
      subtitle: "Central management of the CoSpace catalog.",
      createNewSpace: "Create New Space",
      name: "Space name",
      description: "Detailed description",
      type: "Type",
      capacity: "Capacity",
      price: "Price per hour (USD)",
      imageUrl: "Image URL",
      createBtn: "Create Space",
      existingSpaces: "Existing Spaces Catalog",
      deactivateBtn: "Deactivate Space",
      deactivateConfirm: "Are you sure you want to deactivate this space? Not allowed if future bookings exist.",
      activeStatus: "Active",
      inactiveStatus: "Deactivated",
      createSuccess: "Space created successfully.",
      deactivateSuccess: "Space deactivated successfully.",
    },
    auth: {
      loginTitle: "Welcome Back",
      loginSubtitle: "Sign in to manage and book your workspaces.",
      registerTitle: "Create an Account",
      registerSubtitle: "Join CoSpace to start booking hourly workspaces.",
      nameLabel: "Full name",
      emailLabel: "Email address",
      passwordLabel: "Password",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      noAccount: "Don't have an account? Sign up here",
      hasAccount: "Already have an account? Log in here",
      loginSuccess: "Signed in successfully.",
      registerSuccess: "Registration completed successfully.",
    },
    clock: {
      localTimeTitle: "Your local time",
      bogotaNotice: "All bookings operate in official Bogotá time (UTC-5)",
    },
  },
};

