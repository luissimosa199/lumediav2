import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/utils/mongoDbPromise";

import { NextApiRequest, NextApiResponse } from "next";
import { NextAuthOptions } from "next-auth";
import { Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth";
import { Adapter, AdapterUser } from "next-auth/adapters";

export interface CustomSession extends Session {
  role?: string;
}

interface CustomAdapterUser extends AdapterUser {
  role?: string; // Assuming role is of type string; adjust as necessary
}

export interface CustomNextApiRequest extends NextApiRequest {
  // Add any custom request properties here
}

export interface CustomNextApiResponse<T = any> extends NextApiResponse<T> {
  // Add any custom response properties here
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as CustomAdapterUser).role;
        token.picture = user.image;
      }
      return token;
    },
    session: async ({ session, token }) => {
      (session as CustomSession).role = (token as any).role;
      return session;
    },
  },

  adapter: MongoDBAdapter(clientPromise) as Adapter,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
};

const NextAuthHandler = (
  req: CustomNextApiRequest,
  res: CustomNextApiResponse
) => NextAuth(req, res, authOptions);

export default NextAuthHandler;
