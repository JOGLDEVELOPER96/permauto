// app/api/authorizations/[id]/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// Conectar a la base de datos
async function connectDB() {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw new Error("Error al conectar a la base de datos");
  }
}

// Definir el esquema de autorización si no existe
let Authorization;
try {
  Authorization = mongoose.model("Authorization");
} catch (error) {
  const AuthorizationSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    ruc: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["initiated", "completed", "approved", "rejected"],
      default: "initiated",
    },
    userId: { type: String, required: true },
    approvedBy: { type: String, default: "pending" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timestamp: { type: Date, default: Date.now },
  });

  Authorization = mongoose.model("Authorization", AuthorizationSchema);
}

export async function GET(request, { params }) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener ID de la autorización
    const { id } = params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID de autorización inválido" },
        { status: 400 }
      );
    }

    // Buscar autorización por ID
    const authorization = await Authorization.findById(id);

    // Verificar si la autorización existe
    if (!authorization) {
      return NextResponse.json(
        { message: "Autorización no encontrada" },
        { status: 404 }
      );
    }

    // Responder con la autorización
    return NextResponse.json({ authorization });
  } catch (error) {
    console.error("Error al obtener autorización:", error);
    return NextResponse.json(
      { message: "Error al obtener la autorización", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener ID de la autorización
    const { id } = params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID de autorización inválido" },
        { status: 400 }
      );
    }

    // Obtener datos del cuerpo de la solicitud
    const data = await request.json();

    // Validar datos
    if (
      !data.companyName ||
      !data.ruc ||
      !data.reason ||
      !data.userId ||
      !data.startDate ||
      !data.endDate
    ) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Actualizar autorización
    const updatedAuthorization = await Authorization.findByIdAndUpdate(
      id,
      {
        companyName: data.companyName,
        ruc: data.ruc,
        reason: data.reason,
        status: data.status,
        userId: data.userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        ...(data.approvedBy && { approvedBy: data.approvedBy }),
      },
      { new: true }
    );

    // Verificar si la autorización existe
    if (!updatedAuthorization) {
      return NextResponse.json(
        { message: "Autorización no encontrada" },
        { status: 404 }
      );
    }

    // Responder con la autorización actualizada
    return NextResponse.json({
      message: "Autorización actualizada con éxito",
      authorization: updatedAuthorization,
    });
  } catch (error) {
    console.error("Error al actualizar autorización:", error);
    return NextResponse.json(
      { message: "Error al actualizar la autorización", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Obtener ID de la autorización
    const { id } = params;

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "ID de autorización inválido" },
        { status: 400 }
      );
    }

    // Eliminar autorización
    const deletedAuthorization = await Authorization.findByIdAndDelete(id);

    // Verificar si la autorización existe
    if (!deletedAuthorization) {
      return NextResponse.json(
        { message: "Autorización no encontrada" },
        { status: 404 }
      );
    }

    // Responder con éxito
    return NextResponse.json({
      message: "Autorización eliminada con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar autorización:", error);
    return NextResponse.json(
      { message: "Error al eliminar la autorización", error: error.message },
      { status: 500 }
    );
  }
}
