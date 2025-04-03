export async function fetchDashboardData() {
  try {
    // Obtener datos de usuarios
    const usersResponse = await fetch("/api/admin/users");
    if (!usersResponse.ok) {
      throw new Error(`Error al obtener usuarios: ${usersResponse.statusText}`);
    }
    const usersData = await usersResponse.json();

    // Obtener datos de autorizaciones
    const authResponse = await fetch("/api/admin/authorizations");
    if (!authResponse.ok) {
      throw new Error(
        `Error al obtener autorizaciones: ${authResponse.statusText}`
      );
    }
    const authData = await authResponse.json();

    // Intentar obtener datos de seguridad, pero continuar incluso si hay un error
    let securityData = { success: false, logs: [] };
    try {
      const securityResponse = await fetch("/api/admin/security");
      if (securityResponse.ok) {
        securityData = await securityResponse.json();
      } else {
        console.warn(
          `Error al obtener datos de seguridad: ${securityResponse.statusText}`
        );
        // No lanzar error, simplemente continuar con datos vacíos
      }
    } catch (securityError) {
      console.warn("Error al procesar datos de seguridad:", securityError);
      // No lanzar error, simplemente continuar con datos vacíos
    }

    // Registrar las respuestas para depuración
    console.log("Respuesta de usuarios:", usersData);
    console.log("Respuesta de autorizaciones:", authData);
    console.log("Respuesta de seguridad:", securityData);

    const result = {
      users: {
        total: 0,
        admins: 0,
        subadmins: 0,
        security: 0,
        regular: 0,
        growth: 0,
      },
      authorizations: {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        bySubadmin: [],
      },
      security: {
        entries: 0,
        exits: 0,
        currentPresence: 0,
        byHour: [],
      },
    };

    if (usersData.success) {
      // Procesar datos de usuarios
      const users = usersData.users;
      const admins = users.filter((u) => u.role === "admin").length;
      const subadmins = users.filter((u) => u.role === "subadmin").length;
      const security = users.filter((u) => u.role === "security").length;
      const regular = users.filter((u) => u.role === "user" || !u.role).length;

      // Actualizar datos de usuarios
      result.users = {
        total: users.length,
        admins,
        subadmins,
        security,
        regular,
        growth: 0,
      };

      // Si tenemos datos de autorizaciones, procesarlos
      if (authData.success) {
        const authorizations = authData.authorizations;
        const approved = authorizations.filter(
          (a) => a.status === "approved"
        ).length;
        const rejected = authorizations.filter(
          (a) => a.status === "rejected"
        ).length;
        const pending = authorizations.filter(
          (a) => a.status === "pending"
        ).length;

        // Agrupar por subadmin
        const bySubadmin = [];
        const subadminMap = new Map();

        authorizations.forEach((auth) => {
          if (auth.approvedBy) {
            const subadminId = auth.approvedBy;
            const subadmin = users.find(
              (u) => u._id === subadminId || u.id === subadminId
            );

            if (subadmin) {
              const name = subadmin.name || subadmin.email;
              if (subadminMap.has(name)) {
                subadminMap.set(name, subadminMap.get(name) + 1);
              } else {
                subadminMap.set(name, 1);
              }
            }
          }
        });

        subadminMap.forEach((count, name) => {
          bySubadmin.push({ name, count });
        });

        // Ordenar por cantidad descendente
        bySubadmin.sort((a, b) => b.count - a.count);

        // Actualizar datos de autorizaciones
        result.authorizations = {
          total: authorizations.length,
          approved,
          rejected,
          pending,
          bySubadmin,
        };
      }

      // Si tenemos datos de seguridad, procesarlos
      if (securityData.success && securityData.logs) {
        const securityLogs = securityData.logs;

        // Asegurarse de que los logs existen y son un array
        if (securityLogs && Array.isArray(securityLogs)) {
          // Contar entradas y salidas
          const entries = securityLogs.filter(
            (log) => log.type === "entry"
          ).length;
          const exits = securityLogs.filter(
            (log) => log.type === "exit"
          ).length;

          // Agrupar por hora
          const hourMap = new Map();

          // Inicializar todas las horas del día
          for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, "0") + ":00";
            hourMap.set(hour, { hour, entries: 0, exits: 0 });
          }

          securityLogs.forEach((log) => {
            if (!log.timestamp) return;

            const date = new Date(log.timestamp);
            const hour = date.getHours().toString().padStart(2, "0") + ":00";

            if (!hourMap.has(hour)) {
              hourMap.set(hour, { hour, entries: 0, exits: 0 });
            }

            const hourData = hourMap.get(hour);
            if (log.type === "entry") {
              hourData.entries++;
            } else if (log.type === "exit") {
              hourData.exits++;
            }
          });

          // Convertir a array y ordenar por hora
          const byHour = Array.from(hourMap.values());
          byHour.sort((a, b) => {
            const hourA = parseInt(a.hour.split(":")[0]);
            const hourB = parseInt(b.hour.split(":")[0]);
            return hourA - hourB;
          });

          // Actualizar datos de seguridad
          result.security = {
            entries,
            exits,
            currentPresence: Math.max(0, entries - exits),
            byHour,
            logs: securityLogs, // Incluir los logs completos
          };

          // También añadir los datos brutos en la raíz para mayor compatibilidad
          result.rawSecurityData = securityLogs;
        }
      } else {
        console.log("No hay datos de seguridad disponibles o hubo un error");

        // Crear datos de seguridad vacíos pero con estructura correcta
        const emptyHours = [];
        for (let i = 0; i < 24; i++) {
          const hour = i.toString().padStart(2, "0") + ":00";
          emptyHours.push({ hour, entries: 0, exits: 0 });
        }

        result.security = {
          entries: 0,
          exits: 0,
          currentPresence: 0,
          byHour: emptyHours,
          logs: [],
        };

        result.rawSecurityData = [];
      }
    }

    // Crear una estructura para stats que es lo que espera el componente StatCards
    result.stats = {
      users: result.users,
      authorizations: result.authorizations,
      security: result.security,
    };

    console.log("Datos procesados:", result);
    return result;
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    throw error;
  }
}
