// Imports
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'http://localhost:4000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken:string, refreshToken:string, profile:any, done:VerifyCallback):Promise<any>{

        const { id, displayName, emails } = profile;
        
        const user = {
            id,
            email: emails[0].value,
            name: displayName,
            provider: 'google',
        };

        // Issue JWT
        const result = await this.authService.validateOAuthLogin(user);
        console.log(result);

        done(
            null,
            {
                user:result.user,
                accessToken:result.accessToken
            }
        );

    }
}