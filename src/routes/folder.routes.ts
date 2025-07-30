import { Router } from "express";
import { 
    createFolder, 
    getFoldersByParent, 
    getFolderById, 
    updateFolder, 
    deleteFolder 
} from "../controller/folder.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// All folder routes require authentication
router.use(authMiddleware);

// Folder CRUD operations
router.route("/").post(createFolder);
router.route("/parent/:parentId").get(getFoldersByParent);
router.route("/:folderId")
    .get(getFolderById)
    .put(updateFolder)
    .delete(deleteFolder);

export default router;