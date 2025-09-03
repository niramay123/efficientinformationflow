import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },

  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname); 
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

// Export single file upload handler
export const uploadFiles = multer({ storage }).single("file");
