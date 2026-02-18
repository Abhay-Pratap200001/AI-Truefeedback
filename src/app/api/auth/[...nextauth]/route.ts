import NextAuth from "next-auth";
import { authOptions } from "./options";

// Initialize NextAuth with custom options
const handler = NextAuth(authOptions);

// Export handlers for API routes (GET & POST)
export { handler as GET, handler as POST };
