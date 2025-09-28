import { Strategy as GoogleAuth } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport from "passport";
import { prisma } from "./prisma.client";

dotenv.config();

passport.use(
  new GoogleAuth(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_REDIRECT_URL as string, 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
       if (!email) {
          return done(new Error("Google profile did not supply an email"), undefined);
        }

        let user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              provider: "google",        
              providerId: profile.id,
              email,
              name: profile.displayName || "Google User",
              avatar: profile.photos?.[0]?.value || null,
              verify: true,
            },
          });
        } else {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                providerId: profile.id,
                name: profile.displayName || user.name,
                avatar: profile.photos?.[0]?.value || user.avatar,
                verify: true,
              },
            });
          }          
        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  });

export default passport;
