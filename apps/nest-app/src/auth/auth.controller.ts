import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { ICurrentUser } from './current-user.interface';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@CurrentUser() currentUser: ICurrentUser) {
    return currentUser;
  }
}
