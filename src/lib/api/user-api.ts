import api from "@/lib/api/api";
import {IInviteByEmail, IInviteEntity, ITempInvite} from "@/lib/models/invite";
import {ITempUserCreate, ITempUserUpdate, UserV2} from "@/lib/models/user";
import {ICreateMinisterio, IEditMinisterio, IMinisteriosResponseApi} from "@/lib/models/misterios";
import {IMinistries} from "@/lib/models/user-response-api";
import {WhatsappMessageWithTwilioInput} from "@/lib/models/twilio-whatsapp";

export class UserApi {
    static async fetchMembers(): Promise<any | undefined> {
        const members = await api.get(`/v2/user/all`);

        return members.data;
    }

    static async fetchMembersDiaconos(): Promise<any | undefined> {
        const members = await api.get(`/v2/user/diaconos`);

        return members.data;
    }

    static async fetchMemberById(id: string): Promise<any | undefined> {
        const user = await api.get(`/v2/user/get-by-id/${id}`);

        return user.data;
    }

    static async fetchAllInvitesByMemberId(id: string): Promise<IInviteEntity[]> {
        const user = await api.get(`/v2/user/invites/${id}`);

        return user.data;
    }

    static async fetchBirthdaysMembers(month: number): Promise<any | undefined> {
        return await api.get(`/v2/user/birthdays-month/${month}`);
    }

    static async createMember(body: UserV2): Promise<UserV2> {
        const user = await api.post(`/v2/user`, body);

        return user.data;
    }

    static async requestUpdateUserInfo(body: string[]): Promise<any> {
        const user = await api.post(`/v2/user/request-update`, body);

        return user.data;
    }

    static async updateMember(id: string, body: any): Promise<UserV2> {
        const user = await api.put(`/v2/user/${id}`, body);

        return user.data;
    }

    static async createMemberByInvite(body: UserV2, inviteId: string, password: string): Promise<any | undefined> {
        const user = await api.post(`/v2/user/accept-invite/${inviteId}/${password}`, body);

        return user.data;
    }

    static async deleteMember(id: string): Promise<boolean> {
        const user = await api.delete(`/v2/user/${id}`);

        return user.data;
    }

    static async deleteMinisterio(id: string): Promise<any | undefined> {
        const user = await api.delete(`/v1/ministrie/${id}`);

        return user.data;
    }

    static async updateInfo(body: string[]): Promise<any | undefined> {
        const user = await api.post(`/v1/user/update-info`, body);

        return user.data;
    }

    static async sendInvite(body: IInviteByEmail): Promise<any | undefined> {
        const user = await api.post(`/v2/user/send-invite`, body);

        return user.data;
    }

    static async fetchMinistries (): Promise<IMinistries[]> {
        const user = await api.get(`/v1/ministrie/all`);

        return user.data;
    }

    static async fetchMinistriesV2 (): Promise<IMinisteriosResponseApi[]> {
        const user = await api.get(`/v1/ministrie/all`);

        return user.data;
    }

    static async createMinistrie(body: ICreateMinisterio): Promise<any | undefined> {
        const user = await api.post(`/v1/ministrie`, body);

        return user.data;
    }

    static async editMinistrie(id: string, body: IEditMinisterio): Promise<any | undefined> {
        const user = await api.put(`/v1/ministrie/${id}`, body);

        return user.data;
    }

    static async getUserByEmail(email: string): Promise<any> {
        console.log('api: ', process.env.URL_BACKEND_LOCAL)
        const user = await api.get(`/v1/auth/find-user/${email}`);

        return user.data;
    }

    static async getUserByEmailResetPassword(email: string): Promise<any> {
        const user = await api.get(`/v1/auth/reset-password/${email}`);

        return user.data;
    }

    static async sendWhatsAppMessage(body: WhatsappMessageWithTwilioInput): Promise<any | undefined> {
        const user = await api.post(`/v2/user/whatsapp/send-message`, body);

        return user.data;
    }
}