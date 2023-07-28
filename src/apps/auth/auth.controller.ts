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
import { UsersService } from '../user-management/users/users.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  getPermissions(@Request() req) {
    return this.usersService.getAllPermissions(req.user.roleId);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto, @Res() res) {
    const authData = await this.authService.login(authLoginDto);

    return res.status(200).json(authData);
  }

  @Post('refresh')
  async refresh(@Body() authRefreshDto: AuthRefreshDto, @Res() res) {
    const refreshData = await this.authService.refresh(authRefreshDto.token);
    return res.status(200).json(refreshData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
