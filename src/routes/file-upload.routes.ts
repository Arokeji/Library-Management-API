import fs from "fs";
import multer from "multer";
import express from "express";

const upload = multer({ dest: "public" });

// Export de rutas
export const uploadRoutes = express.Router();

uploadRoutes.post("/", upload.single("file"), (req, res, next) => {
  try {
    const originalName = req?.file?.originalname;
    const path = req?.file?.path;

    const newPath = `${path as string}_${originalName as string}`;

    // Asigna a la propiedad path el valor de newPath
    fs.renameSync(path as string, newPath);

    res.send("✅ File uploaded succesfully.");
    console.log("✅ File uploaded succesfully.");
  } catch (error) {
    next(error);
  }
});
