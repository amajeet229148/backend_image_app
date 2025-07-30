import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

import userRoutes from './routes/user.routes';
import folderRoutes from './routes/folder.routes';
import imageRoutes from './routes/image.routes';

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/folders', folderRoutes);
app.use('/api/v1/images', imageRoutes);


export { app };