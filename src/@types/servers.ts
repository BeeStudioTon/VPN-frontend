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
    name_server: string;
    geo: string;
    ip: string;
    load_server: string;
    conf_data: string;
    max_users: number;
    active: number;
    info: ServerInfo;
}
