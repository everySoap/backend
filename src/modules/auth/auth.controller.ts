import {
  Body, Controller, Post, Res, UseFilters, HttpCode, HttpStatus, UseGuards, Put,
} from '@nestjs/common';
import { Response } from 'express';

import { AllExceptionFilter } from '@server/common/filter/exception.filter';
import { CreateUserDto } from '@server/modules/user/dto/user.dto';
import { Roles } from '@server/common/decorator/roles.decorator';
import { User } from '@server/common/decorator/user.decorator';
import { AuthGuard } from '@server/common/guard/auth.guard';
import { AuthService } from './auth.service';
import { ValidatorEmailDto, ResetPasswordDto, NewPasswordDto } from './dto/auth.dto';
import { Role } from '../user/enum/role.enum';
import { UserEntity } from '../user/user.entity';

@Controller('auth')
@UseGuards(AuthGuard)
@UseFilters(new AllExceptionFilter())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  public async signup(
    @Body() body: CreateUserDto,
  ) {
    const data = await this.authService.emailSignup(body);
    return data;
  }

  @Post('logout')
  public async logout(
    @Res() res: Response,
  ) {
    res.clearCookie('Authorization', {
      domain: process.env.COOKIE_DOMAIN,
    });
    res.json();
  }

  @Post('validatorEmail')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async validatorEmail(
    @Body() body: ValidatorEmailDto,
  ) {
    return this.authService.validatorEmail(body);
  }

  @Post('resetMail')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetMail(
    @User() user: UserEntity,
  ) {
    return this.authService.resetMail(user);
  }

  @Put('resetPassword')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resetPassword(
    @User() user: UserEntity,
    @Body() data: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user, data);
  }

  @Put('newPassword')
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async newPassword(
    @User() user: UserEntity,
    @Body() data: NewPasswordDto,
  ) {
    return this.authService.newPassword(user, data);
  }
}
