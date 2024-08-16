import {Auth} from 'firebase/auth';

export class UserAuthApi {
    static async fetchUserFromDatabase(
        auth: Auth,
    ): Promise<any | undefined> {
        // if (auth.currentUser) {
        //   const email = auth.currentUser.providerData[0].email
        //     ? encodeURIComponent(auth.currentUser.providerData[0].email)
        //     : auth.currentUser.providerData[0].email;
        //
        //   const user = await axiosInstance.get(`/user/auth/find?email=${email}`);
        //
        //   return user.data;
        // }
        return {
            id: '123',
            name: 'John Doe',
            email: '',
            role: 'user',
            status: 'active',
            cpf: '12345678900',
            birthdate: '1990-01-01',
        }
    }
}
