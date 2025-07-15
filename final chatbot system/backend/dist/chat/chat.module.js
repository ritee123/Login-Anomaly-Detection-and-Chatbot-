"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_session_entity_1 = require("./entities/chat-session.entity");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const auth_module_1 = require("../auth/auth.module");
const soc_module_1 = require("../soc/soc.module");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_session_entity_1.ChatSession, chat_message_entity_1.ChatMessage]),
            auth_module_1.AuthModule,
            soc_module_1.SocModule,
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService],
    })
], ChatModule);
exports.ChatModule = ChatModule;
