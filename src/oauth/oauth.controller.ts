import { BadRequestException, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { OauthServerService } from './oauth-server/oauth-server.service';

// tslint:disable-next-line: no-var-requires
const OAuth2Server = require('oauth2-server');

@Controller('oauth')
export class OauthController {
  constructor(
    private readonly oauthServerService: OauthServerService,
  ) {}

  @Post('/token')
  public async accessToken(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      console.log(2424124124124124);
      const request = new OAuth2Server.Request(req);
      const response = new OAuth2Server.Response(res);
      const token = await this.oauthServerService.server.token(request, response);
      res.cookie('Authorization', `Bearer ${token.accessToken}`, {
        expires: token.accessTokenExpiresAt,
        httpOnly: true,
      });
      res.json(token);
    } catch (err) {
      if (
        err instanceof OAuth2Server.OAuthError ||
        err instanceof OAuth2Server.InvalidArgumentError ||
        err instanceof OAuth2Server.ServerError
      ) {
        throw new UnauthorizedException(err.message);
      }
      throw new BadRequestException(err.message);
    }
  }
}
