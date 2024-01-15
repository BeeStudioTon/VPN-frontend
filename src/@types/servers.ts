import { Info } from './user'

export interface ServersType {
    id: number
    name_server: string
    geo: string
    ip: string
    info: Info
    load_server: string
    conf_data: string
    max_users: number
    active: number
}
