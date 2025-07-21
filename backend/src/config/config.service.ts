import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshSecret: string;
  refreshExpiresIn: string;
}

export interface ApiConfig {
  prefix: string;
  version: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  api: ApiConfig;
}

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get port(): number {
    return this.nestConfigService.get<number>('port') || 3000;
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('nodeEnv') || 'development';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get database(): DatabaseConfig {
    return {
      url: this.nestConfigService.get<string>('database.url') || '',
    };
  }

  get jwt(): JwtConfig {
    return {
      secret: this.nestConfigService.get<string>('jwt.secret') || '',
      expiresIn: this.nestConfigService.get<string>('jwt.expiresIn') || '1d',
      refreshSecret: this.nestConfigService.get<string>('jwt.refreshSecret') || '',
      refreshExpiresIn: this.nestConfigService.get<string>('jwt.refreshExpiresIn') || '7d',
    };
  }

  get api(): ApiConfig {
    return {
      prefix: this.nestConfigService.get<string>('api.prefix') || 'api',
      version: this.nestConfigService.get<string>('api.version') || '1.0',
    };
  }

  get<T>(key: string): T | undefined {
    return this.nestConfigService.get<T>(key);
  }

  getOrThrow<T>(key: string): T {
    const value = this.nestConfigService.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Configuration key "${key}" is required but not found`);
    }
    return value;
  }
}
