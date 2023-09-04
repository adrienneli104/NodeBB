import { Request, Response, NextFunction } from 'express';
import messaging from '../../messaging';
import meta from '../../meta';
import user from '../../user';
import privileges from '../../privileges';
import helpers from '../helpers';

export async function get(req: Request & { uid: number },
    res: Response, next: NextFunction): Promise<void> {
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (meta.config.disableChat) {
        return next();
    }

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const uid: number = await user.getUidByUserslug(req.params.userslug) as number;
    if (!uid) {
        return next();
    }
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const canChat: boolean = await privileges.global.can('chat', req.uid) as boolean;
    if (!canChat) {
        return next(new Error('[[error:no-privileges]]'));
    }

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const recentChats: ChatData = await messaging.getRecentChats(req.uid, uid, 0, 19) as ChatData;
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

    type ChatData = {
        rooms: object[],
        nextStart: number,
        title: string,
        uid: number,
        userslug: string,
        roomName: string,
        usernames: string,
        canViewInfo: boolean
    }

    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const room: ChatData = await messaging.loadRoom(req.uid, { uid: uid, roomId: req.params.roomid }) as ChatData;
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
    room.canViewInfo = await privileges.global.can('view:users:info', uid) as boolean;

    res.render('chats', room);
}

export async function redirectToChat(req: Request & { uid: number }
    & { loggedIn: number }, res: Response, next: NextFunction): Promise<void> {
    if (!req.loggedIn) {
        return next();
    }
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const userslug: string = await user.getUserField(req.uid, 'userslug') as string;
    if (!userslug) {
        return next();
    }
    const roomid: number = parseInt(req.params.roomid, 10);
    helpers.redirect(res, `/user/${userslug}/chats${roomid ? `/${roomid}` : ''}`);
}
