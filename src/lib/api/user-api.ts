import api from "@/lib/api/api";
import {IInviteByEmail, ITempInvite} from "@/lib/models/invite";
import {ITempUserCreate} from "@/lib/models/user";

export class UserApi {
    static async fetchMembers(): Promise<any | undefined> {
        return await api.get(`/user/all`);
    }

    static async fetchBirthdaysMembers(month: number): Promise<any | undefined> {
        return await api.get(`/user/birthdays-month/${month}`);
    }

    static async createMember(body: ITempUserCreate): Promise<any | undefined> {
        const user = await api.post(`/user`, body);

        return user.data;
    }

    static async createMemberByInvite(body: ITempInvite): Promise<any | undefined> {
        const user = await api.post(`/user/accept-invite`, body);

        return user.data;
    }

    static async sendInvite(body: IInviteByEmail): Promise<any | undefined> {
        const user = await api.post(`/user/email/send-invite`, body);

        return user.data;
    }
}