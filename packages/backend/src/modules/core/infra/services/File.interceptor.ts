import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { extname } from 'path';
import * as fs from 'fs';

export const UseFileInterceptor = FileInterceptor('image', {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const uploadPath = path.resolve(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      callback(null, uploadPath);
    },
    filename: (req, file, callback) => {
      const files = fs.readdirSync(path.resolve(__dirname, '..', 'uploads'));
      const fileExtName = extname(file.originalname);
      const fileName = `${file.fieldname}-${files.length + 1}${fileExtName}`;
      callback(null, fileName);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
});
