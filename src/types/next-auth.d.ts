import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: "nurse" | "admin";
      firstName?: string;
      lastName?: string;
      profilePictureUrl?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    role: "nurse" | "admin";
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "nurse" | "admin";
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
  }
}
