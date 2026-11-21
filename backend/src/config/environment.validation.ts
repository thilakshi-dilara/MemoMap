import 'dotenv/config';

export interface Environment {
  DATABASE_URL: string;
  FRONTEND_ORIGIN: string;
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: `${number}${'s' | 'm' | 'h' | 'd'}`;
  REFRESH_TOKEN_TTL_DAYS: number;
}

export function validateEnvironment(config: Record<string, unknown>): Environment {
  const getString = (key: string, fallback: string): string => {
    const value = config[key];
    return typeof value === 'string' ? value : fallback;
  };
  const databaseUrl = getString('DATABASE_URL', '');
  const frontendOrigin = getString('FRONTEND_ORIGIN', 'http://localhost:5173');
  const nodeEnv = getString('NODE_ENV', 'development');
  const port = Number(getString('PORT', '3000'));
  const jwtAccessSecret = getString('JWT_ACCESS_SECRET', '');
  const jwtAccessExpiresIn = getString('JWT_ACCESS_EXPIRES_IN', '15m');
  const refreshTokenTtlDays = Number(getString('REFRESH_TOKEN_TTL_DAYS', '30'));
  if (!databaseUrl.startsWith('mysql://')) throw new Error('DATABASE_URL must be a MySQL connection URL.');
  if (!['development', 'test', 'production'].includes(nodeEnv)) throw new Error('NODE_ENV must be development, test, or production.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
  if (jwtAccessSecret.length < 32) throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long.');
  if (!/^\d+[smhd]$/.test(jwtAccessExpiresIn)) throw new Error('JWT_ACCESS_EXPIRES_IN must use a positive s, m, h, or d duration (for example 15m).');
  if (!Number.isInteger(refreshTokenTtlDays) || refreshTokenTtlDays < 1 || refreshTokenTtlDays > 365) throw new Error('REFRESH_TOKEN_TTL_DAYS must be an integer between 1 and 365.');
  return { DATABASE_URL: databaseUrl, FRONTEND_ORIGIN: frontendOrigin, NODE_ENV: nodeEnv as Environment['NODE_ENV'], PORT: port, JWT_ACCESS_SECRET: jwtAccessSecret, JWT_ACCESS_EXPIRES_IN: jwtAccessExpiresIn as Environment['JWT_ACCESS_EXPIRES_IN'], REFRESH_TOKEN_TTL_DAYS: refreshTokenTtlDays };
}
