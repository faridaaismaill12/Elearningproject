import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// import { CartModule } from './modules/cart/cart.module';
import { CommunicationModule } from './modules/communication/communication.module';
// import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes the ConfigModule available globally in the app
        }),
        MongooseModule.forRoot(process.env.MONGO_URI || 'your_default_mongo_uri'),
        // CartModule,
        CommunicationModule,
        // UserModule,
        // other modules...
    ],
})
export class AppModule { }
