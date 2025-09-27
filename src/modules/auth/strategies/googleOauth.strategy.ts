
// import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
// import { GoogleOauthConfig } from 'src/configs';
// import passport from 'passport';
// import { AuthRepository } from '../auth.repository';
// import { OptionalException } from '@/common';

// export class GoogleOauthStrategy {
// 	private readonly authRepository: AuthRepository;

// 	constructor(authRepository: AuthRepository) {
// 		this.authRepository = authRepository;
		
// 		passport.use('google', new Strategy(
// 			{
// 				clientID: GoogleOauthConfig.clientId,
// 				clientSecret: GoogleOauthConfig.clientSecret,
// 				callbackURL: GoogleOauthConfig.redirectUri,
// 				scope: ['email', 'profile']
// 			},
// 			this.validate.bind(this)
// 		));
// 	}

// 	async validate(
// 		accessToken: string,
// 		refreshToken: string,
// 		profile: Profile,
// 		done: VerifyCallback
// 	): Promise<void> {
// 		try {
// 			console.log('Google Access Token:', accessToken);
// 			console.log('Google Refresh Token:', refreshToken);
// 			console.log('Google Profile:', profile);

// 			const googleAuthData = {
// 				accessToken,
// 				refreshToken,
// 				profile,
// 				user: {
// 					googleId: profile.id,
// 					email: profile.emails?.[0]?.value,
// 					name: profile.displayName,
// 					avatar: profile.photos?.[0]?.value,
// 					verified: profile.emails?.[0]?.verified || false
// 				}
// 			};
// 			console.log(`🚀 ~ googleOauth.strategy.ts:49 ~ GoogleOauthStrategy ~ validate ~ googleAuthData:`, googleAuthData)

// 			done(null, googleAuthData);

// 		} catch (error) {
// 			console.error('Error in Google OAuth validation:', error);
// 			done(error, false);
// 		}
// 	}
// }
