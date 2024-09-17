import api from "@/lib/api/api";

export class UserApi {
    static async fetchMembers(): Promise<any | undefined> {
        return await api.get(`/user/all`);
    }

    static async fetchBirthdaysMembers(month: number): Promise<any | undefined> {
        return await api.get(`/user/birthdays-month/${month}`);
    }

    static async createMember(body: any): Promise<any | undefined> {
        const user = await api.post(`/user`, body);

        return user.data;
    }
}