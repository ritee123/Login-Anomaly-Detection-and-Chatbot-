"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const chat_module_1 = require("./chat/chat.module");
const admin_module_1 = require("./admin/admin.module"); // Import AdminModule
const chat_session_entity_1 = require("./chat/entities/chat-session.entity");
const chat_message_entity_1 = require("./chat/entities/chat-message.entity");
const user_entity_1 = require("./auth/entities/user.entity");
const soc_module_1 = require("./soc/soc.module");
const login_activity_entity_1 = require("./soc/entities/login-activity.entity");
const soc_user_entity_1 = require("./soc/entities/soc-user.entity");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            // Default Connection
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'default',
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME'),
                    entities: [chat_session_entity_1.ChatSession, chat_message_entity_1.ChatMessage, user_entity_1.User],
                    synchronize: true,
                }),
                inject: [config_1.ConfigService],
            }),
            // Second connection for 'application' database
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'applicationConnection',
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: 'application',
                    entities: [login_activity_entity_1.LoginActivity, soc_user_entity_1.SocUser],
                    synchronize: false,
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            admin_module_1.AdminModule,
            soc_module_1.SocModule, // Add AdminModule here
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
