// Imports
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { randomBytes } from 'crypto';


// Service
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}


    // Handling user login
    async validateOAuthLogin(user: {
        id: string;
        email: string;
        name: string;
        provider: string;
    }) {

        // Check if user exists
        let dbUser = await this.prisma.user.findUnique({
            where: { email: user.email },
        });


        // If not, create user with default role CLIENT
        if (!dbUser) {
            dbUser = await this.prisma.user.create({
                data: {
                    name: user.name,
                    email: user.email,
                    image: null,
                    role: Role.PENDING
                },
            });
        }


        // Generate access and refresh tokens
        const tokens = await this.issueTokens(dbUser);


        // Return
        return {
            user: dbUser,
            ...tokens,
        };

    }


    // Generate new access, refresh tokens, and a new session
    private async issueTokens(user: User) {

        // Payload
        const payload = { sub: user.id, email: user.email, role: user.role };


        // Access token
        const accessToken = this.jwtService.sign(payload, {expiresIn:'15m'});
        
        
        // Generate opaque refresh token
        const tokenId = crypto.randomUUID();
        const secret = randomBytes(32).toString('hex');
        const hashedSecret = await bcrypt.hash(secret, 10);
        const refreshToken = `${tokenId}.${secret}`;


        // Create expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);


        // Creating session
        await this.prisma.session.create({
            data: {
                userId: user.id,
                tokenId,
                refreshToken:hashedSecret,
                expiresAt
            }
        });


        // Return
        return {accessToken, refreshToken};

    }


    // Refresh tokens
    async refreshTokens(oldRefreshToken:string){

        // Split refreshToken into tokenId + secret
        const parts = oldRefreshToken.split('.');
        if (parts.length !== 2) throw new UnauthorizedException('Invalid refresh token format');
        const [tokenId, secret] = parts;


        // Find session by tokenId
        const session = await this.prisma.session.findUnique({where:{tokenId}});
        if (!session) throw new UnauthorizedException('Session not found');


        // Compare secret with hashedSecret
        const isMatch = await bcrypt.compare(secret, session.refreshToken);
        if (!isMatch) throw new UnauthorizedException('Invalid refresh token');

    
        // Check expiration
        if (new Date() > session.expiresAt) {
            await this.prisma.session.delete({where:{id:session.id}});
            throw new UnauthorizedException('Refresh token expired');
        }


        // Get user
        const user = await this.prisma.user.findUnique({where:{id:session.userId}});
        if (!user) throw new UnauthorizedException('User not found');

    
        // Delete old session (rotation)
        await this.prisma.session.delete({where:{id:session.id}});


        // Issue new tokens
        const tokens = await this.issueTokens(user);


        // Return
        return tokens;

    }


    // Logout user and remove sessions
    async logout(userId:string){
        await this.prisma.session.deleteMany({where:{userId}});
        return {success:true};
    }

}