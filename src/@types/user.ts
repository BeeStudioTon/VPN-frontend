export interface UserType {
    info: Info
    infoUser: InfoUser
    user: User
}

export interface Info {
    area: number;
    city: string;
    country: string;
    eu: string;
    ll: number[]
    metro: number
    range: number[]
    region: string
    timezone: string
}

export interface InfoUser {
    limit: number;
    used: number;
}

export interface User {
    active_server: number
    ban: number
    date_subscribe: number
    free_activated: number
    id: number
    id_telegram: string
    lang: string
    end_sub: number
    reg_date: number
    type_subscribe: number
    username: string
}
