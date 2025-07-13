"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocUser = void 0;
// @ts-nocheck
const typeorm_1 = require("typeorm");
const login_activity_entity_1 = require("./login-activity.entity");
let SocUser = class SocUser {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SocUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SocUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], SocUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hashed_password', select: false }),
    __metadata("design:type", String)
], SocUser.prototype, "hashed_password", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_blocked', default: false }),
    __metadata("design:type", Boolean)
], SocUser.prototype, "isBlocked", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => login_activity_entity_1.LoginActivity, loginActivity => loginActivity.user),
    __metadata("design:type", Array)
], SocUser.prototype, "loginActivities", void 0);
SocUser = __decorate([
    (0, typeorm_1.Entity)('users')
], SocUser);
exports.SocUser = SocUser;
