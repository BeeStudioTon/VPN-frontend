import { User } from './user'

export interface KeysType {
    keys: KeyType[]
    user: User
}

export interface KeyType {
    active: number
    id: number
    id_outline: string
    id_server: number
    id_telegram: string
    id_user: string
    key_data: string
    reg_date: number
}
