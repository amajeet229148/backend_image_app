import { Router } from "express";
import {
    uploadImage,
    getImagesByFolder,
    searchImages,
    getImageById,
    updateImage,
    deleteImage,
    getAllUserImages
} from "../controller/image.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

// All image routes require authentication
router.use(authMiddleware);

// Image operations
router.route("/upload").post(upload.single("image"), uploadImage);
router.route("/search").get(searchImages);
router.route("/folder/:folderId").get(getImagesByFolder);
router.route("/all").get(getAllUserImages);
router.route("/:imageId")
    .get(getImageById)
    .put(updateImage)
    .delete(deleteImage);

export default router;