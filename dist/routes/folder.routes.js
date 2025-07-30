"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const folder_controller_1 = require("../controller/folder.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All folder routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Folder CRUD operations
router.route("/").post(folder_controller_1.createFolder);
router.route("/parent/:parentId").get(folder_controller_1.getFoldersByParent);
router.route("/:folderId")
    .get(folder_controller_1.getFolderById)
    .put(folder_controller_1.updateFolder)
    .delete(folder_controller_1.deleteFolder);
exports.default = router;
