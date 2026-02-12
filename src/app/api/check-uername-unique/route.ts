import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { usernameValidation } from "@/Schemas/signUpSchema";
import z from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {username: searchParams.get("username")};

    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      console.log(usernameErrors);

      return Response.json(
        {
          success: false,
          message: "Error checking username",
          usernameErrors,
        },
        { status: 400 },
      );
    }


    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is not available try another one",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "username is unique",
      },
      { status: 400 },
    );

  } catch (error) {
    console.error("Error while checking username veridication", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 },
    );
  }
}
