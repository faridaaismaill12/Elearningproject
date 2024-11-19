import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunicationModule } from './modules/communication/communication.module';
// import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/your-db-name'), // Replace with your DB connection URI
        CommunicationModule,
        // UserModule,
    ],
})
export class AppModule { }
