"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToChat = exports.get = void 0;
const messaging_1 = __importDefault(require("../../messaging"));
const meta_1 = __importDefault(require("../../meta"));
const user_1 = __importDefault(require("../../user"));
const privileges_1 = __importDefault(require("../../privileges"));
const helpers_1 = __importDefault(require("../helpers"));
function get(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (meta_1.default.config.disableChat) {
            return next();
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const uid = yield user_1.default.getUidByUserslug(req.params.userslug);
        if (!uid) {
            return next();
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const canChat = yield privileges_1.default.global.can('chat', req.uid);
        if (!canChat) {
            return next(new Error('[[error:no-privileges]]'));
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const recentChats = yield messaging_1.default.getRecentChats(req.uid, uid, 0, 19);
        if (!recentChats) {
            return next();
        }
        if (!req.params.roomid) {
            return res.render('chats', {
                rooms: recentChats.rooms,
                uid: uid,
                userslug: req.params.userslug,
                nextStart: recentChats.nextStart,
                allowed: true,
                title: '[[pages:chats]]',
            });
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const room = yield messaging_1.default.loadRoom(req.uid, { uid: uid, roomId: req.params.roomid });
        if (!room) {
            return next();
        }
        room.rooms = recentChats.rooms;
        room.nextStart = recentChats.nextStart;
        room.title = room.roomName || room.usernames || '[[pages:chats]]';
        room.uid = uid;
        room.userslug = req.params.userslug;
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        room.canViewInfo = (yield privileges_1.default.global.can('view:users:info', uid));
        res.render('chats', room);
    });
}
exports.get = get;
function redirectToChat(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.loggedIn) {
            return next();
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const userslug = yield user_1.default.getUserField(req.uid, 'userslug');
        if (!userslug) {
            return next();
        }
        const roomid = parseInt(req.params.roomid, 10);
        helpers_1.default.redirect(res, `/user/${userslug}/chats${roomid ? `/${roomid}` : ''}`);
    });
}
exports.redirectToChat = redirectToChat;
