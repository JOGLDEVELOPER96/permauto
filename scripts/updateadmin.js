import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
dotenv.config({ path: resolve(__dirname, "../.env") });

// Definir el esquema de usuario directamente en el script
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date,
});

async function createOrUpdateUsers() {
  try {
    // Obtener la URI de MongoDB desde las variables de entorno
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error(
        "Error: MONGODB_URI no está definido en las variables de entorno"
      );
      process.exit(1);
    }

    console.log("Conectando a MongoDB...");
    console.log("URI:", MONGODB_URI); // Solo para depuración, eliminar en producción

    await mongoose.connect(MONGODB_URI);
    console.log("Conectado a MongoDB");

    // Crear modelo de usuario
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    // Definir los usuarios a crear/actualizar
    const usersToUpdate = [
      {
        email: "subadmin@subadmin.com",
        name: "Usuario Subadministrador",
        password: "subadmin",
        role: "subadmin",
      },
      {
        email: "security@security.com",
        name: "Usuario de Seguridad",
        password: "security",
        role: "security",
      },
    ];

    // Procesar cada usuario
    for (const userData of usersToUpdate) {
      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      console.log(`Hash de contraseña generado para ${userData.email}`);

      // Buscar si el usuario ya existe
      const existingUser = await User.findOne({ email: userData.email });

      let result;

      if (existingUser) {
        // Actualizar usuario existente
        result = await User.updateOne(
          { email: userData.email },
          {
            $set: {
              name: userData.name,
              password: hashedPassword,
              role: userData.role,
            },
          }
        );

        console.log(
          `Resultado de la actualización para ${userData.email}:`,
          result
        );

        if (result.modifiedCount === 0) {
          console.log(
            `No se realizaron cambios para ${userData.email} (posiblemente ya tenía estos valores)`
          );
        } else {
          console.log(`Usuario ${userData.email} actualizado correctamente`);
        }
      } else {
        // Crear nuevo usuario
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          createdAt: new Date(),
        });

        await newUser.save();
        console.log(`Usuario ${userData.email} creado correctamente`);
      }
    }

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("Conexión cerrada");
  } catch (error) {
    console.error("Error al crear/actualizar usuarios:", error);

    // Intentar cerrar la conexión en caso de error
    try {
      await mongoose.connection.close();
      console.log("Conexión cerrada después de error");
    } catch (err) {
      console.error("Error al cerrar conexión:", err);
    }
  }
}

// Ejecutar la función
createOrUpdateUsers();
