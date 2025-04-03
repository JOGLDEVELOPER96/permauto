import { NextResponse } from "next/server";
import connectToDatabase from "$/lib/mongodb";
import User from "$/models/User";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    // Obtener token de la cookie
    const token = request.cookies.get("token")?.value;
    console.log("Token recibido:", token ? "Presente" : "Ausente");

    if (!token) {
      console.log("No se encontró token en las cookies");
      return NextResponse.json(
        { success: false, message: "No autorizado - Token no encontrado" },
        { status: 401 }
      );
    }

    try {
      // Verificar token
      const secret = process.env.JWT_SECRET;
      console.log("JWT_SECRET disponible:", !!secret);

      const decoded = jwt.verify(token, secret);
      console.log("Token decodificado:", decoded);

      // Conectar a la base de datos
      await connectToDatabase();

      // Buscar usuario por ID
      const user = await User.findById(decoded.id).select("-password");
      console.log("Usuario encontrado:", !!user);

      if (!user) {
        console.log("Usuario no encontrado con ID:", decoded.id);
        return NextResponse.json(
          { success: false, message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      // Devolver información del usuario
      return NextResponse.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error al verificar token:", error);
      return NextResponse.json(
        { success: false, message: "Token inválido", error: error.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error en /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Error del servidor", error: error.message },
      { status: 500 }
    );
  }
}
