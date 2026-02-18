import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      // Fields shown on the login form
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      // Runs when user tries to log in
      async authorize(credentials: any): Promise<any> {
        // Connect to database
        await dbConnect();

        try {
          // Find user by email or username
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifire },
              { username: credentials.identifire },
            ],
          });

          // If user not found
          if (!user) {
            throw new Error("No user found with this email");
          }

          // Check if account is verified
          if (!user.isVerified) {
            throw new Error("Please verify your account first before login");
          }

          // Compare entered password with hashed password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // If password matches, allow login
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect credentials or password");
          }

        } catch (error: any) {
          console.error(error);
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    // Store extra data in JWT
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }

      return token;
    },

    // Send JWT data to session
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }

      return session;
    },
  },

  // Custom sign-in page
  pages: {
    signIn: "/sign-in",
  },

  // Use JWT instead of database sessions
  session: {
    strategy: "jwt",
  },

  // Secret for encrypting tokens
  secret: process.env.NEXTAUTH_SECRET,
};
