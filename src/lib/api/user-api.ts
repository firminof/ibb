import {Auth} from 'firebase/auth';
import api from "@/lib/api/api";

export class UserApi {
    static async fetchMembers(): Promise<any | undefined> {
        const user = await api.get(`/user/all`);

        return user.data;
    }

    static async createMember(body: any): Promise<any | undefined> {
        const user = await api.post(`/user`, body);

        return user.data;
    }
}