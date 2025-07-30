"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controller/user.controller");
const router = (0, express_1.Router)();
router.route("/").post(user_controller_1.registerUser);
router.route("/login").post(user_controller_1.loginUser);
exports.default = router;
