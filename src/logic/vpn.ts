/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import axios from 'axios'

import { ServersType } from '../@types/servers'
import { UserType } from '../@types/user'
import { RatesType } from '../@types/rates'
import { ActiveServerType } from '../@types/active-server'
import { InfoType } from '../@types/info'
import { TransactionType } from '../@types/transaction'

export class VPN {
    private _url: string = 'https://lobster-app-7recs.ondigitalocean.app/'

    public async get (url: string, data: any): Promise<any | undefined> {
        try {
            const res = await axios.get(`${this._url}${url}?${new URLSearchParams(data)}`)

            return res?.data
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    public async post (url: string, data: any): Promise<any | undefined> {
        try {
            const res = await axios.post(`${this._url}${url}`, data)

            return res?.data
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    public async postAuth (): Promise<UserType | undefined> {
        const res = await this.post('auth', { tg_data: window.Telegram.WebApp.initData })

        return res?.data
    }

    public async getServers (): Promise<ServersType[] | []> {
        const res = await this.get('getServers', {})

        return res?.data as ServersType[]
    }

    public async getRates (): Promise<any | undefined> {
        const res = await this.get('getRates', {})

        return res?.data as RatesType[]
    }

    public async getKeys (): Promise<any[] | undefined> {
        const res = await this.post('getKeys', { tg_data: window.Telegram.WebApp.initData })

        return res?.data
    }

    public async activateFree (): Promise<any | undefined> {
        const data = await this.post('activateFree', { tg_data: window.Telegram.WebApp.initData })
        return data?.data
    }

    public async getKey (id_server: number): Promise<any | undefined> {
        const data = await this.post('getKey', { tg_data: window.Telegram.WebApp.initData, id_server })

        return data?.data
    }

    public async getActive (): Promise<any | undefined> {
        const data = await this.post('getActive', { tg_data: window.Telegram.WebApp.initData })

        return data?.data as ActiveServerType
    }

    public async getTransactions (): Promise<any | undefined> {
        const data = await this.post('getTransactions', { tg_data: window.Telegram.WebApp.initData })

        return data?.data as TransactionType
    }

    public async getIpInfo (ip: string): Promise<any | undefined> {
        const data = await this.get('ipInfo', { ip })

        return data
    }

    public async getInfo (): Promise<any | undefined> {
        const data = await this.post('getInfo', { tg_data: window.Telegram.WebApp.initData })

        return data?.data as InfoType
    }

    public async getAutoKey (): Promise<any | undefined> {
        const data = await this.post('getAutoKey', { tg_data: window.Telegram.WebApp.initData })

        return data?.data
    }
}
