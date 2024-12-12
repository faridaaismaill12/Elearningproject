import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const DatabaseConfig = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DB_CONN_STRING');

        if (!uri) {
            console.error('DB_CONN_STRING is not defined in .env file');
            throw new Error('DB_CONN_STRING is not defined');
        }

        console.log('DB Connection URI:', uri);

        return {
            uri,
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            connectionFactory: (connection) => {
                console.log('Attaching Mongoose connection listeners...');

                // Attach listeners to the provided connection instance
                connection.on('connected', () => {
                    console.log(`Successfully connected to the database: ${uri}`);
                });

                connection.on('error', (err: Error) => {
                    console.error(`Database connection error: ${err.message}`);
                });

                return connection;
            },
        };
    },
});
