import z from "zod";

export const usernameValidation = z
  .string()
  .min(4, "User name has to be min 4 charcahter")
  .max(20, "User name has to be under 20 charachterS")
  .regex(/^[a-zA-Z0-9_]+$/, "User name does not support special character");



export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message:'Invalid email address'}),
    password: z.string().min(6, {message:'password must be 6 character'}).max(20)
})

