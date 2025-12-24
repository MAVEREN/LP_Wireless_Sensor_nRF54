import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-azure-ad-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureAdStrategy extends PassportStrategy(Strategy, 'azure-ad') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('AZURE_AD_CLIENT_ID'),
      clientSecret: configService.get('AZURE_AD_CLIENT_SECRET'),
      callbackURL: configService.get('AZURE_AD_CALLBACK_URL'),
      tenant: configService.get('AZURE_AD_TENANT_ID'),
      resource: 'https://graph.microsoft.com',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      email: profile.upn || profile.email,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      displayName: profile.displayName,
      roles: profile.roles || [],
    };
    done(null, user);
  }
}
