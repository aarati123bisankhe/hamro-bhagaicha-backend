import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { HttpError } from "../errors/http-error";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads";

    if (file.fieldname === "profileUrl") {
      folder = "uploads/profile";
    }

    const uploadPath = path.resolve(process.cwd(), folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req: Request, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new HttpError(400, "Only image files are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploads = {
  fields: (fields: { name: string; maxCount?: number }[]) =>
    upload.fields(fields),
};