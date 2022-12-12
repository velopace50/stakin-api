import { ConnectionOptions } from 'typeorm';
import * as PostgressConnectionStringParser from 'pg-connection-string';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionOptions = PostgressConnectionStringParser.parse(
  process.env.DATABASE_URL,
);

// Check typeORM documentation for more information.
const config: ConnectionOptions = {
  type: 'postgres',
  host: connectionOptions.host,
  port: Number(connectionOptions.port),
  username: connectionOptions.user,
  password: connectionOptions.password,
  database: connectionOptions.database,
  extra: {
    ssl: true, //true for hosting.-test-mode
  },
  entities: [__dirname + '/**/*.entity{.ts,.js}'],

  // We are using migrations, synchronize should be set to false.
  synchronize: false,

  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: true,
  logging: false,
  logger: 'file',

  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    // Location of migration should be inside src folder
    // to be compiled into dist/ folder.
    migrationsDir: 'src/migrations',
  },
};

export = config;
