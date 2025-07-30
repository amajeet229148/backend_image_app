"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const image_controller_1 = require("../controller/image.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = (0, express_1.Router)();
// All image routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Image operations
router.route("/upload").post(multer_middleware_1.upload.single("image"), image_controller_1.uploadImage);
router.route("/search").get(image_controller_1.searchImages);
router.route("/folder/:folderId").get(image_controller_1.getImagesByFolder);
router.route("/all").get(image_controller_1.getAllUserImages);
router.route("/:imageId")
    .get(image_controller_1.getImageById)
    .put(image_controller_1.updateImage)
    .delete(image_controller_1.deleteImage);
exports.default = router;
