import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {

    // Constructor
    constructor(private readonly authService: AuthService) {}


    // Login with Google (Passport handles redirects)
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(){}


    // Callback
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthCallback(@Req() req, @Res({ passthrough: true }) res: Response) {

        // Response
        const { user, accessToken, refreshToken } = req.user;


        // Store refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });


        // Return only safe data + access token
        return {user, accessToken};

    }


    // Refresh tokens
    @Post('refresh')
    @HttpCode(200)
    async refresh(@Req() req: Request, @Res({passthrough:true}) res:Response) {

        // Accessing refresh token from http cookies
        const oldRefreshToken = req.cookies['refreshToken'];
        if (!oldRefreshToken) throw new UnauthorizedException('No refresh token provided');


        // Tokens
        const {accessToken, refreshToken} = await this.authService.refreshTokens(oldRefreshToken);


        // Set new refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });


        // Send access token to client
        return {accessToken};

    }


    @Delete('logout')
    @HttpCode(200)
    async logout(@Body() dto:LogoutDto) {
        await this.authService.logout(dto.userId);
        return {success:true, message:'Logged out successfully'};
    }

};