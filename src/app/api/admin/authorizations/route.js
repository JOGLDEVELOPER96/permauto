import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Authorization from "@/models/Authorization";
import User from "@/models/User";
import jwt from "jsonwebtoken";

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectToDatabase();

    // Buscar usuario por ID
    const adminUser = await User.findById(decoded.id).select("-password");

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si es administrador o subadmin
    if (adminUser.role !== "admin" && adminUser.role !== "subadmin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Acceso denegado - Se requiere rol de administrador o subadministrador",
        },
        { status: 403 }
      );
    }

    // Obtener todas las autorizaciones
    const authorizations = await Authorization.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Transformar _id y otros ObjectId a string para que sean serializables
    const serializedAuthorizations = authorizations.map((auth) => ({
      ...auth,
      _id: auth._id.toString(),
      id: auth._id.toString(),
      userId: auth.userId ? auth.userId.toString() : null,
      approvedBy: auth.approvedBy ? auth.approvedBy.toString() : null,
    }));

    console.log(`Obtenidas ${serializedAuthorizations.length} autorizaciones`);

    return NextResponse.json({
      success: true,
      authorizations: serializedAuthorizations,
    });
  } catch (error) {
    console.error("Error al obtener autorizaciones:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener autorizaciones",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
