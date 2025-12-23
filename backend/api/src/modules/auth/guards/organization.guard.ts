import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OrganizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.organizationId || request.body.organizationId;

    if (!user || !user.organizations) {
      return false;
    }

    // Check if user has access to this organization
    return user.organizations.some(org => org.id === organizationId);
  }
}
