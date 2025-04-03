import { NextResponse } from "next/server";
import connectToDatabase from "$/lib/mongodb";
import User from "$/models/User";
import jwt from "jsonwebtoken";

// Función auxiliar para verificar administrador
async function verifyAdmin(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return { success: false, message: "No autorizado - Token no encontrado" };
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectToDatabase();

    // Buscar usuario por ID
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verificar si es administrador
    if (user.role !== "admin") {
      return {
        success: false,
        message: "Acceso denegado - Se requiere rol de administrador",
      };
    }

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error al verificar administrador:", error);
    return { success: false, message: "Error al verificar administrador" };
  }
}

// Actualizar un usuario (rol)
export async function PUT(request, { params }) {
  try {
    // Verificar si el usuario es administrador
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, message: adminCheck.message },
        { status: 401 }
      );
    }

    const { id } = params;
    const { role } = await request.json();

    // Validar el rol
    if (role !== "user" && role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Rol inválido" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Actualizar el rol del usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al actualizar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Eliminar un usuario
export async function DELETE(request, { params }) {
  try {
    // Verificar si el usuario es administrador
    const adminCheck = await verifyAdmin(request);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, message: adminCheck.message },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    // Verificar que no se elimine a sí mismo
    const currentAdmin = adminCheck.user;
    if (currentAdmin.id.toString() === id) {
      return NextResponse.json(
        { success: false, message: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // Eliminar el usuario
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al eliminar usuario",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
