"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express_1.default.json({ limit: '16kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '16kb' }));
app.use(express_1.default.static('public'));
app.use((0, cookie_parser_1.default)());
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const folder_routes_1 = __importDefault(require("./routes/folder.routes"));
const image_routes_1 = __importDefault(require("./routes/image.routes"));
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/folders', folder_routes_1.default);
app.use('/api/v1/images', image_routes_1.default);
