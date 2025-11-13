import multer from "multer";
import fs from "fs";
import path from "path";


const uploadDir = path.join(process.cwd(), "uploads");

// 🟢 Create uploads folder automatically if it doesn’t exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });