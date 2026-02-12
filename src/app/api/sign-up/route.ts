//signup route used to signup user for first time

import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";


export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();     //accepting values from req.json
    const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true});  //finding user into db and isVerified

    //if user already exist send the response sucess false because user already exits
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }


    const existingUserByEmail = await UserModel.findOne({ email }); // finding user by email
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); //creting verified code otp for verification

    if (existingUserByEmail) {
      
      if (existingUserByEmail.isVerified) { //if there is user in db with email and verification
        return Response.json(
          {
            success: false,
            message: "User already exist with this email",
          },
          { status: 500 },
        );
        
      } else {  //if user is exist but it not verifed on that senariouse we have to verify the user

        //we are overwriting the existing password
        const hashedPassword = await bcrypt.hash(password, 7);
        existingUserByEmail.password = hashedPassword; //
        //

        existingUserByEmail.verifyCode = verifyCode; //updating verifyCode
        
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }

    } else {  //if user is not into db then we follow this algorithm

      const hasedPassword = await bcrypt.hash(password, 7);  //hashed/ the password

      // expiring the verifycode date after one hour
      const expiryDate = new Date();  
      expiryDate.setHours(expiryDate.getHours() + 1);
      //

      const newUser = new UserModel({  //saving the user
        username,
        email,
        password: hasedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }


    // sending emailresponse to user 
    const emailResponse = await sendVerificationEmail(email, username, verifyCode); 
    console.log(emailResponse, '1');
    
    if (!emailResponse.success) { //if response got failed 
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }

    //if response successfully resolve
    return Response.json(
      {
        success: true,
        message: "User registerd successfully. Please verify your email",
      },
      { status: 201 },
    );

  } catch (error) {
    console.error("Error while registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error while registering user",
      },
      { status: 500 },
    );
  }
}
