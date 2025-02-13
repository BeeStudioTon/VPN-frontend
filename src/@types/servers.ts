interface ServerInfo {
    range: number[];
    country: string;
    region: string;
    eu: string;
    timezone: string;
    city: string;
    ll: number[];
    metro: number;
    area: number;
}

export interface ServerData {
    id: number;

    nameServer: string;

    geo: string;

    ipServer: string;

    maxUsers: number;

    userCountOnline: number;

    active: boolean;

    createdAt: string;
}
