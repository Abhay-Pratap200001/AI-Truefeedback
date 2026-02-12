//used to send verification email to user

import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string,
): Promise<ApiResponse> {

  try {
await resend.emails.send({  //sending the mail
  from: 'onboarding@resend.dev',
  to: email,
  subject: 'Verification email',
  react: VerificationEmail({username, otp:verifyCode}),
});
    return { success: true, message: "Verification email send successfully" };
  } catch (error) {
    console.error("Error sending verification email", error);
    return { success: false, message: "Failed ton send verification messages" };
  }
}
