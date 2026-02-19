import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

/**
 * POST: Update whether the logged-in user is accepting messages or not.
 * This is used when the user toggles the "accept messages" switch in the UI.
 */
export async function POST(request: Request) {
  // Make sure we are connected to the database before doing anything
  await dbConnect();

  // Get the current session to know who is making this request
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // If there is no active session, the user is not authenticated
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 },
    );
  }

  // Extract the logged-in user's ID from the session
  const userId = user._id;

  // Get the updated "acceptMessages" value from the request body
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }, // Return the updated document instead of the old one
    );

    // If no user was found, something went wrong
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 },
      );
    }

    // Successfully updated the user's preference
    return Response.json(
      {
        success: true,
        message: "Messages acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    // Log the actual error for debugging purposes
    console.log("Failed to update user status to accept messages", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 },
    );
  }
}

/**
 * GET: Fetch the current user's message acceptance status.
 * This helps the frontend know whether the toggle should be ON or OFF.
 */
export async function GET(request: Request) {
  // Ensure database connection
  await dbConnect();

  // Get the current authenticated session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  // Block access if the user is not logged in
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not authenticated",
      },
      { status: 401 },
    );
  }

  // Extract the user ID from session
  const userId = user._id;

  try {
    // Find the user in the database
    const foundUser = await UserModel.findById(userId);

    // If user doesn't exist in DB (edge case)
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    // Send back only what the frontend actually needs
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      { status: 200 },
    );
  } catch (error) {
    // Helpful for debugging unexpected DB or runtime issues
    console.log("Error while getting message acceptance status", error);

    return Response.json(
      {
        success: false,
        message: "Error in getting message acceptance",
      },
      { status: 500 },
    );
  }
}
