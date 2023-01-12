import { uploadImageMapper, users } from '../utils/Mapper';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
import { upload } from '../utils/multerConfig';

const uploadPicture = upload.single('profile');

export const uploadProfilePic = async (
  req: Request,
  res: Response<any, { userId: string }>,
  next: NextFunction
) => {
  uploadPicture(req, res, err => {
    // get user type , user id and image name
    const userId = res.locals.userId;
    const userRole: string = req.query.user as string;
    const pictureFileName = req.file?.filename as string;

    // handle file upload errors
    if (err) {
      return next(new CustomError(StatusCodes.BAD_REQUEST, err.message));
    }

    // user type is not specified
    if (!userRole || !users.includes(userRole)) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'missing or wrong user type')
      );
    }

    // file exists
    if (!req.file) {
      return next(
        new CustomError(StatusCodes.BAD_REQUEST, 'please choose an image')
      );
    }
    // valid ext
    if (!isValidSize(req.file)) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          'image size is too large > 3mb'
        )
      );
    }

    // valid size
    if (!isValidExt(req.file)) {
      return next(
        new CustomError(
          StatusCodes.BAD_REQUEST,
          'invalid extension (jpg , jpeg or png)'
        )
      );
    }
    // save picture name to database
    try {
      uploadImageMapper.get(userRole)!(userId, pictureFileName);
    } catch {
      new CustomError(
        StatusCodes.BAD_REQUEST,
        'error while uploading your image , try again'
      );
    }
    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'file uploaded successfully' });
  });
};

const isValidSize = (picture: Express.Multer.File) => picture.size < 3_000_000;

const isValidExt = (picture: Express.Multer.File) =>
  picture.mimetype === 'image/jpg' ||
  picture.mimetype === 'image/jpeg' ||
  picture.mimetype === 'image/png';
