import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
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

    // Verificar si es administrador
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

    // Obtener todos los usuarios, excluyendo la contraseña
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener usuarios",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
