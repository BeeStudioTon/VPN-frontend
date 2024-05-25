import { UserTypeUser } from './user'

export interface KeysType {
    keys: KeyType[]
    user: UserTypeUser
}

export interface KeyType {
    id: number
    idOutline: string
    key: string
    serverId: string
}
