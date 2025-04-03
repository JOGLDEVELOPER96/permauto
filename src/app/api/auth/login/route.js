import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectToDatabase from "$/lib/mongodb";
import User from "$/models/User";

export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json();

    // Añade logs para depuración
    console.log("Login attempt:", { email, passwordProvided: !!password });

    // Validar datos
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Correo electrónico y contraseña son requeridos",
        },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    await connectToDatabase();

    // Buscar usuario
    const user = await User.findOne({ email });

    // Añade logs para depuración
    console.log("User found:", !!user);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Verificar que la contraseña del usuario exista
    if (!user.password) {
      console.error(
        "Error: La contraseña del usuario no está definida en la base de datos"
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "Error en la configuración de la cuenta. Contacte al administrador.",
        },
        { status: 500 }
      );
    }

    // Verificar contraseña
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Añade logs para depuración
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Credenciales incorrectas" },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error("Error al comparar contraseñas:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Error al verificar credenciales",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Normalizar el rol para el token JWT
    const normalizedRole = user.role === "admin" ? "admin" : "user";

    console.log("Original role:", user.role);
    console.log("Normalized role for token:", normalizedRole);

    // Crear token JWT con el rol normalizado
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: normalizedRole, // Usar el rol normalizado
      },
      process.env.JWT_SECRET || "jwt_secret_fallback", // Fallback para desarrollo
      {
        expiresIn: rememberMe ? "30d" : "1d", // 30 días o 1 día
      }
    );

    // Configurar cookie
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 días o 1 día en segundos

    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge,
      sameSite: "strict",
    });

    // Devolver usuario sin contraseña y con rol normalizado
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: normalizedRole, // Usar el rol normalizado
    };

    console.log("User response with normalized role:", userResponse);

    return NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
