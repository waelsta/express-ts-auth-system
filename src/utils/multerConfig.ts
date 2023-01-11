import { randomUUID } from 'crypto';
import multer from 'multer';

// configuring multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.PROFILE_PICTURES_FOLDER as string);
  },

  filename: function (req, file, cb) {
    cb(null, `${randomUUID()}-${file.originalname}`);
  }
});

export const upload = multer({
  storage: storage
});
