export interface UserType {
    user: UserTypeUser
    infoUser: InfoUserType
}

export interface UserTypeUser {
    id: string
    tdId: string
    lang: string
    userName: string
    usedTrial: boolean
    ban: boolean
    activeAt: string
    activeTo: string
    activeTariff: ActiveTariffType
}

export interface ActiveTariffType {
    id: string
    name: string
    description: string
    price: number
    period: number
    priceOld: number
}

export interface InfoUserType {
    used: number
    limit: number
}
