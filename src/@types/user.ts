export interface UserType extends UserTypeUser {
}

export interface UserTypeUser {
    id: string
    telegramId: string
    nickname: string
    avatar: string
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
