export interface IInviteByEmail {
    requestName: string;
    to: string;
    subject: string;
    text: string;
    phone: string;
    memberIdRequested?: string;
}

export interface IInviteEntity {
    _id: string;
    memberIdRequested: string;
    requestName: string;
    to: string | null;
    phone: string | null;
    isAccepted: boolean;
    createdAt: Date;
    updatedAt: Date;
}