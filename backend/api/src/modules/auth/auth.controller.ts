import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password or token' })
  async login(@Body() loginDto: { email: string }) {
    // TODO: Implement proper login logic
    const user = await this.authService.validateUser(loginDto.email);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  // @UseGuards(JwtAuthGuard) // Will be enabled once fully implemented
  async getProfile(@Request() req) {
    return req.user;
  }
}
