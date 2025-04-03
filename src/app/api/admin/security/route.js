import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SecurityLog from "@/models/SecurityLog";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    // Verificar si el usuario es administrador
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No autorizado - Token no encontrado" },
        { status: 401 }
      );
    }

    // Verificar token
    console.log("Verificando token JWT...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verificado correctamente");

    // Conectar a la base de datos
    console.log("Conectando a la base de datos...");
    await connectToDatabase();
    console.log("Conexión a la base de datos exitosa");

    // Buscar usuario por ID
    console.log("Buscando usuario con ID:", decoded.id);
    const adminUser = await User.findById(decoded.id).select("-password");

    if (!adminUser) {
      console.log("Usuario no encontrado con ID:", decoded.id);
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log("Usuario encontrado:", adminUser.email || adminUser.name);

    // Verificar si es administrador, subadmin o seguridad
    if (
      adminUser.role !== "admin" &&
      adminUser.role !== "subadmin" &&
      adminUser.role !== "security"
    ) {
      console.log("Rol de usuario no autorizado:", adminUser.role);
      return NextResponse.json(
        {
          success: false,
          message:
            "Acceso denegado - Se requiere rol de administrador, subadministrador o seguridad",
        },
        { status: 403 }
      );
    }

    // Listar todas las colecciones en la base de datos
    console.log("Listando colecciones en la base de datos...");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);
    console.log("Colecciones disponibles:", collectionNames);

    // Verificar si la colección securityLogs existe
    if (!collectionNames.includes("securityLogs")) {
      console.log(
        "ADVERTENCIA: La colección 'securityLogs' no existe en la base de datos"
      );
    }

    try {
      // Obtener todos los registros de seguridad
      console.log("Obteniendo registros de seguridad...");
      console.log("Modelo SecurityLog:", SecurityLog);
      console.log(
        "Nombre de la colección en el modelo:",
        SecurityLog.collection.name
      );

      // Intentar obtener directamente de la colección
      let logs = [];
      if (collectionNames.includes("securityLogs")) {
        logs = await mongoose.connection.db
          .collection("securityLogs")
          .find({})
          .sort({ timestamp: -1 })
          .toArray();
        console.log(
          `Encontrados ${logs.length} registros de seguridad directamente de la colección`
        );
      } else {
        logs = await SecurityLog.find({}).sort({ timestamp: -1 }).lean();
        console.log(
          `Encontrados ${logs.length} registros de seguridad usando el modelo`
        );
      }

      // Transformar _id y otros ObjectId a string para que sean serializables
      const serializedLogs = logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
        id: log._id.toString(),
        userId: log.userId ? log.userId.toString() : null,
      }));

      console.log(`Obtenidos ${serializedLogs.length} registros de seguridad`);
      console.log(
        "Muestra de los primeros 2 registros:",
        serializedLogs.slice(0, 2)
      );

      return NextResponse.json({
        success: true,
        logs: serializedLogs,
      });
    } catch (logsError) {
      console.error("Error al obtener registros de seguridad:", logsError);
      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener registros de seguridad",
          error: logsError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error general en la API de seguridad:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener registros de seguridad",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
