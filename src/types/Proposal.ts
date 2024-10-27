export interface Proposal {
    id?: number; // Optional because it might not be set before insertion
    title: string;
    subtitle: string;
    body: string;
    type: number; // Foreign key, Proposal Type
    approved?: boolean; // Optional, default to false
    reviewed?: boolean; // Optional, default to false
    status?: number; // Foreign key, Status, optional
    submitdate: Date;
    openvote?: Date; // Optional
    snapshot?: Date; // Optional
    closevote?: Date; // Optional
}

