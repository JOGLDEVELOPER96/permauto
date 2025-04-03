import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Conectar a la base de datos
    await connectToDatabase();

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { success: false, message: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "30d" }
    );

    // Crear respuesta con cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Usuario registrado correctamente",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    // Establecer cookie con el token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al registrar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
