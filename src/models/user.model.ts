import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Document } from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    refreshToken?: string;
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
    },
    refreshToken: {
        type: String,
        default: null,
    }
}, { timestamps: true });


userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})


userSchema.methods.comparePassword = async function(password: string){
    return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);

