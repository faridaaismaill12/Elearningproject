import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
// import { CartModule } from './modules/cart/cart.module';
import { CommunicationModule } from './modules/communication/communication.module';
//import { UserModule } from './modules/user/user.module';
import { NoteModule } from './modules/notes/notes.module';
import { Note } from './modules/notes/schemas/note.schema';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Loads .env file globally
        }),
        DatabaseConfig,
        // CartModule,
        CommunicationModule,
        NoteModule,
        // other modules...
    ],
})
export class AppModule { }
