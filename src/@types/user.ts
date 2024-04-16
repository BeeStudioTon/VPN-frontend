export interface UserType {
    infoUser: InfoUser
    user: User
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
    usedTrial: boolean
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
