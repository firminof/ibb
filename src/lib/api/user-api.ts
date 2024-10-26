import api from "@/lib/api/api";
import {IInviteByEmail, ITempInvite} from "@/lib/models/invite";
import {ITempUserCreate, ITempUserUpdate} from "@/lib/models/user";
import {ICreateMinisterio, IEditMinisterio, IMinisteriosResponseApi} from "@/lib/models/misterios";
import {IMinistries} from "@/lib/models/user-response-api";
import {WhatsappMessageWithTwilioInput} from "@/lib/models/twilio-whatsapp";

export class UserApi {
    static async fetchMembers(): Promise<any | undefined> {
        return await api.get(`/user/all`);
    }

    static async fetchMemberById(id: string): Promise<any | undefined> {
        const user = await api.get(`/user/get-by-id/${id}`);

        return user.data;
    }

    static async fetchBirthdaysMembers(month: number): Promise<any | undefined> {
        return await api.get(`/user/birthdays-month/${month}`);
    }

    static async createMember(body: ITempUserCreate): Promise<any | undefined> {
        const user = await api.post(`/user`, body);

        return user.data;
    }

    static async updateMember(id: string, body: ITempUserUpdate): Promise<any | undefined> {
        const user = await api.put(`/user/${id}`, body);

        return user.data;
    }

    static async createMemberByInvite(body: ITempInvite): Promise<any | undefined> {
        const user = await api.post(`/user/accept-invite`, body);

        return user.data;
    }

    static async deleteMember(id: string): Promise<any | undefined> {
        const user = await api.delete(`/user/${id}`);

        return user.data;
    }

    static async deleteMinisterio(id: string): Promise<any | undefined> {
        const user = await api.delete(`/ministrie/${id}`);

        return user.data;
    }

    static async updateInfo(body: string[]): Promise<any | undefined> {
        const user = await api.post(`/user/update-info`, body);

        return user.data;
    }

    static async sendInvite(body: IInviteByEmail): Promise<any | undefined> {
        const user = await api.post(`/user/email/send-invite`, body);

        return user.data;
    }

    static async fetchMinistries (): Promise<IMinistries[]> {
        const user = await api.get(`/ministrie/all`);

        return user.data;
    }

    static async fetchMinistriesV2 (): Promise<IMinisteriosResponseApi[]> {
        const user = await api.get(`/ministrie/all`);

        return user.data;
    }

    static async createMinistrie(body: ICreateMinisterio): Promise<any | undefined> {
        const user = await api.post(`/ministrie`, body);

        return user.data;
    }

    static async editMinistrie(id: string, body: IEditMinisterio): Promise<any | undefined> {
        const user = await api.put(`/ministrie/${id}`, body);

        return user.data;
    }

    static async getUserByEmail(email: string): Promise<any> {
        console.log('api: ', process.env.URL_BACKEND_LOCAL)
        const user = await api.get(`/auth/find-user/${email}`);

        return user.data;
    }

    static async getUserByEmailResetPassword(email: string): Promise<any> {
        const user = await api.get(`/auth/reset-password/${email}`);

        return user.data;
    }

    static async sendWhatsAppMessage(body: WhatsappMessageWithTwilioInput): Promise<any | undefined> {
        const user = await api.post(`/user/whatsapp/send-message`, body);

        return user.data;
    }
}