'use client';

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  // Get current session data
  const { data: session } = useSession();

  // If user is logged in
  if (session) {
    return (
      <>
        {/* Show user email */}
        Signed in as {session.user.email}
        <br />

        {/* Logout button */}
        <button onClick={() => signOut()}>
          Sign out
        </button>
      </>
    );
  }

  // If user is not logged in
  return (
    <>
      Not signed in
      <br />

      {/* Login button */}
      <button onClick={() => signIn()}>
        Sign in
      </button>
    </>
  );
}
