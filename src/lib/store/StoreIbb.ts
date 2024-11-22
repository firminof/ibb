import {create} from 'zustand'
import {persist, devtools} from "zustand/middleware";

export type IStore = {
    user: any;
    role: string;
    mongoId: string;
    addUser: (user: any) => void;
    addRole: (role: string) => void;
    addMongoId: (mongoId: string) => void;
    hasHydrated: boolean; // Novo estado para saber se o Zustand foi hidratado
    setHasHydrated: (state: boolean) => void;
    addDiaconos: (diaconos: any) => void;
    diaconos: any[];
}

export const useStoreIbb = create<IStore>()(
    persist(
        devtools((set) => ({
            user: null,
            role: '',
            mongoId: '',
            hasHydrated: false, // Inicialmente falso
            addUser: (user: any) => set(() => ({ user })),
            addRole: (role: string) => set(() => ({ role })),
            addMongoId: (mongoId: string) => set(() => ({ mongoId })),
            setHasHydrated: (state: boolean) => set(() => ({ hasHydrated: state })), // Atualiza o estado de hidratação
            addDiaconos: (diaconos: any) => set(() => (diaconos)),
            diaconos: []
        })),
        {
            name: 'user-store',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true); // Marca como hidratado quando os dados do localStorage são carregados
            },
        }
    )
)