import z from "zod";

export const MessageSchema = z.object({
    content: z
    .string()
    .min(10, {message:'Message has to be minimum ten charachter'})
    .max(200, {message:'Message has to be under 200 charachter'})
})