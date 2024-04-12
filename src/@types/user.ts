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
    activeAt: number
    activeTariff: IActiveTariff | null
    activeTo: string
    balance: number
    idServer: number
    id: number
    ban: boolean
    tgId: string
    lang: string
    userName: string
}

export interface IActiveTariff {
    description: string
    id: number
    name: string
    period: number
    price: number
    priceOld: number
}
