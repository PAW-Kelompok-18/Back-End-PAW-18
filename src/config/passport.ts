/* eslint-disable @typescript-eslint/no-explicit-any */
// src/config/passport.ts
import passport, { Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel, User } from '../models/User';
import { DocumentType } from '@typegoose/typegoose';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
    },
    async (
      _accessToken,
      _refreshToken,
      profile: Profile,
      done: (error: Error | null, user?: any) => void,
    ) => {
      try {
        const user = await findOrCreate(profile.id, profile!.emails![0].value);
        return done(null, user);
      } catch (error) {
        return done(error as Error, null);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, (user as DocumentType<User>)._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user: DocumentType<User> | null = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

async function findOrCreate(
  googleId: string,
  email: string,
): Promise<DocumentType<User>> {
  let user = await UserModel.findOne({ googleId, email });

  if (!user) {
    user = await UserModel.create({ googleId, email });
  }

  return user;
}

export default passport;
