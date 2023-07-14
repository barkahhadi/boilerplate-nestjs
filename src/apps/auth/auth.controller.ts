/*
 * Author: Barkah Hadi
 * Email: barkah.hadi@gmail.com
 * Last Modified: Wed Jul 05 2023 1:49:35 PM
 * File: auth.controller.ts
 * Description: Auth Controller
 */

import {
  Controller,
  Body,
  Post,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { AuthRefreshDto } from './dto/auth-refresh.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto, @Res() res) {
    const authData = await this.authService.login(authLoginDto);

    return res.status(200).json(authData);
  }

  @Post('refresh')
  refresh(@Body() authRefreshDto: AuthRefreshDto, @Res() res) {
    const refreshData = this.authService.refresh(authRefreshDto.token);
    return res.status(200).json(refreshData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
