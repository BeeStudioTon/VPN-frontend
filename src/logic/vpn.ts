/* eslint-disable class-methods-use-this */

import axios, { AxiosResponse } from 'axios'


import { UserType, UserTypeUser } from '../@types/user'
import { RatesType } from '../@types/rates'
import { KeyType } from '../@types/get-keys'
import { ServerData } from '../@types/servers'

enum ApiEndpoints {
    GET_USER = 'api/v2/user/getUser',
    CHECK_PAYMENT = 'api/v2/tariff/checkPayment',
    GET_SERVERS = 'getServers',
    GET_TARIFFS = 'api/v2/tariff/getTariffs',
    GET_KEYS = 'getKeys',
    ACTIVATE_FREE = 'activateFree',
    GET_KEY = 'getKey',
    CREATE_TRANSACTION = 'api/v2/tariff/createTransaction'
}

export class VPN {
    private _url: string = 'https://lobster-app-7recs.ondigitalocean.app/'

    private getHeaders () {
        return { 'telegram-data': window.Telegram.WebApp.initData }
    }

    private async get<T> (url: string, data: Record<string, any>): Promise<T> {
        const res = await axios.get<T>(`${this._url}${url}?${new URLSearchParams(data)}`, { headers: this.getHeaders() })
        return res.data
    }

    private async post<T> (url: string, data: any): Promise<AxiosResponse<T>> {
        const res = await axios.post<T>(`${this._url}${url}`, data, { headers: this.getHeaders() })
        return res
    }

    public async postAuth (): Promise<UserType> {
        const res = await axios.get<UserType>(`${this._url}${ApiEndpoints.GET_USER}`, { headers: this.getHeaders() })
        return res.data
    }

    public async checkPayment (): Promise<UserTypeUser> {
        const res = await axios.get<UserTypeUser>(`${this._url}${ApiEndpoints.CHECK_PAYMENT}`, { headers: this.getHeaders() })
        return res.data
    }

    public async getServers (): Promise<ServerData[]> {
        const res = await this.get<{ data: ServerData[] }>(ApiEndpoints.GET_SERVERS, {})
        return res.data
    }

    public async getRates (): Promise<RatesType[]> {
        const res = await axios.get<RatesType[]>(`${this._url}${ApiEndpoints.GET_TARIFFS}`, { headers: this.getHeaders() })
        return res.data
    }

    public async getKeys (): Promise<KeyType[]> {
        const res = await this.post<{ keys: KeyType[] }>(ApiEndpoints.GET_KEYS, {})
        return res.data.keys
    }

    // TODO
    public async activateFree (): Promise<any> {
        const data = await this.post<any>(ApiEndpoints.ACTIVATE_FREE, { tg_data: window.Telegram.WebApp.initData })
        return data
    }

    public async getKey (id_server: number): Promise<KeyType> {
        // const data = querystring.stringify({ id_server })
        const res = await axios.post<KeyType>(`${this._url}${ApiEndpoints.GET_KEY}`, {id_server: id_server}, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...this.getHeaders()
            }
        })
        return res.data
    }

    // TODO
    public async getInvoice (tariffId: string, tokenAddress: string, userAddress: string): Promise<any> {
        const res = await axios.get<any>(
            `${this._url}${ApiEndpoints.CREATE_TRANSACTION}?tariffId=${tariffId}&tokenAddress=${tokenAddress}&userAddress=${userAddress}`,
            { headers: this.getHeaders() }
        )
        return res.data
    }
}
