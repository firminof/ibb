import {create} from 'zustand'
import {persist, devtools} from "zustand/middleware";

export type IStore = {
    user: any;
    role: string;
    mongoId: string;
    photo: string;
    sessionDuration: number;
    loggout: boolean;
    addUser: (user: any) => void;
    addLoggout: (loggout: boolean) => void;
    addRole: (role: string) => void;
    addSessionDuration: (sessionDuration: string) => void;
    addMongoId: (mongoId: string) => void;
    addPhoto: (photo: string) => void;
    hasHydrated: boolean; // Novo estado para saber se o Zustand foi hidratado
    setHasHydrated: (state: boolean) => void;

    addDiaconos: (diaconos: any[]) => void;
    diaconos: any[];

    membros: any[];
    addMembros: (membros: any[]) => void;
    totalMembros: number;
    addTotalMembros: (totalMembros: number) => void;

    addMinisterios: (ministerios: any[]) => void;
    ministerios: any[];
}

export const useStoreIbb = create<IStore>()(
    persist(
        devtools((set) => ({
            user: null,
            role: '',
            mongoId: '',
            photo: '',
            hasHydrated: false, // Inicialmente falso
            loggout: false, // Inicialmente falso
            addUser: (user: any) => set(() => ({ user })),
            addSessionDuration: (sessionDuration: any) => set(() => ({ sessionDuration })),
            addLoggout: (loggout: any) => set(() => ({ loggout })),
            addPhoto: (photo: any) => set(() => ({ photo })),
            addRole: (role: string) => set(() => ({ role })),
            addMongoId: (mongoId: string) => set(() => ({ mongoId })),
            setHasHydrated: (state: boolean) => set(() => ({ hasHydrated: state })), // Atualiza o estado de hidratação

            addDiaconos: (diaconos: any) => set(() => ({diaconos})),
            diaconos: [],

            membros: [],
            addMembros: (membrosRecebidos: any) => set(() => ({membros: membrosRecebidos})),

            totalMembros: 0,
            addTotalMembros: (totalMembros: number) => set(() => ({ totalMembros})),

            ministerios: [],
            addMinisterios: (ministeriosRecebidos: any) => set(() => ({ministerios: ministeriosRecebidos})),
        })),
        {
            name: 'user-store',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true); // Marca como hidratado quando os dados do localStorage são carregados
            },
        }
    )
)