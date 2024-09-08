import { diskStorage } from 'multer';
import { extname } from 'path';
import { ensureDirSync } from 'fs-extra';

export const multerConfig = (
  directory: string,
  fileType: 'image' | 'xlsx',
) => ({
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const dynamicDestination =
        fileType === 'image'
          ? `./public/images/${directory}`
          : `./public/files/${directory}`;
      ensureDirSync(dynamicDestination);
      cb(null, dynamicDestination);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedImageTypes = /jpeg|jpg|png|gif/;
    const allowedXlsxType = /xlsx/;
    const ext = extname(file.originalname).toLowerCase();

    if (fileType === 'image') {
      const isValidType = allowedImageTypes.test(ext);
      if (isValidType) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    } else if (fileType === 'xlsx') {
      const isValidType = allowedXlsxType.test(ext);
      if (isValidType) {
        cb(null, true);
      } else {
        cb(new Error('Only XLSX files are allowed!'), false);
      }
    }
  },
});
