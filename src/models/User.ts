import mongoose, { Schema, Document } from "mongoose";

//Message model Document
export interface Message extends Document {
  content: string;
  createdAt: Date;
}

//Message model schema
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});



//User model Document
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified:boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}


//User model schema
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "User name is requires"],
    trim: true,
    unique: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use valid email address"],
  },

  password: {
    type: String,
    required: [true, "password is required"],
    unique: true,
  },

  verifyCode: {
    type: String,
    required: [true, "VerifyCode is required"],
  },

  verifyCodeExpiry: {
    type: Date,
    required: [true, 'Verify code Expiry is required'], 
  },

  isVerified:{
    type: Boolean,
    default: false
  },

  isAcceptingMessage:{
    type: Boolean,
    default: true
  },

  messages: [MessageSchema]
});

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel