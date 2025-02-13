/* eslint-disable class-methods-use-this */

import axios, { AxiosResponse } from 'axios'


import { UserType, UserTypeUser } from '../@types/user'
import { RatesType } from '../@types/rates'
import { KeyType } from '../@types/get-keys'
import { ServerData } from '../@types/servers'
import { IAuthTokensResponse } from '../@types/auth'


enum ApiEndpoints {
    TELEGRAM_LOGIN = 'auth/telegram/login',
    JWT_REFRESH = 'auth/jwt/refresh',
    GET_USER = 'user',
    GET_INVOICE_LIST = 'invoice/list',
    CREATE_INVOICE = 'invoice/create',
    GET_KEY_LIST = 'key/list',
    GET_OR_CREATE_KEY = 'key/getOrCreate/',
    CREATE_KEY = 'key/create',
    GET_SERVER_LIST = 'server/list',
    GET_SUBSCRIBE_LIST = 'subscribe/list',
    GET_IP = 'ping/ip'
}

export class VPN {
    private _url: string = 'https://sea-lion-app-eo2pw.ondigitalocean.app/'
    // private _url: string = 'https://localhost:3001/'

    private getHeaders (key?: string | undefined) {
        console.log('key', key)
        return key ? { 'Authorization': `Bearer ${key}` } : {}
    }

    public async postAuth (key: string): Promise<UserType> {
        const res = await axios.get<UserType>(`${this._url}${ApiEndpoints.GET_USER}`, { headers: this.getHeaders(key) })
        return res.data
    }

    public async getJWT (): Promise<UserType> {
        const res = await axios.get<UserType>(`${this._url}${ApiEndpoints.JWT_REFRESH}`, { headers: this.getHeaders() })
        return res.data
    }

    public async telegramLogin (init: string): Promise<IAuthTokensResponse> {
        const res = await axios.post<IAuthTokensResponse>(`${this._url}${ApiEndpoints.TELEGRAM_LOGIN}`, {webAppInitData: init },  { headers: this.getHeaders() })
        return res.data
    }

    public async getServers (key: string): Promise<ServerData[]> {
        const res =  await axios.get<{ list: ServerData[] }>(`${this._url}${ApiEndpoints.GET_SERVER_LIST}?skip=0&take=50`, { headers: this.getHeaders(key) })
        return res.data.list
    }

    public async getRates (key: string): Promise<RatesType[]> {
        const res = await axios.get<{list: RatesType[]}>(`${this._url}${ApiEndpoints.GET_SUBSCRIBE_LIST}?skip=0&take=50`, { headers: this.getHeaders(key) })
        return res.data.list
    }

    public async getKeys (key: string): Promise<KeyType[]> {
        const res = await axios.get<{list: KeyType[]}>(`${this._url}${ApiEndpoints.GET_KEY_LIST}?skip=0&take=50`, { headers: this.getHeaders(key) })
        return res.data.list
    }

    public async getIp (): Promise<string> {
        const res = await axios.get<{ip: string}>(`${this._url}${ApiEndpoints.GET_IP}`, { headers: this.getHeaders() })
        return res.data.ip
    }

    // TODO
    // public async activateFree (): Promise<any> {
    //     const data = await this.post<any>(ApiEndpoints.ACTIVATE_FREE, { tg_data: window.Telegram.WebApp.initData })
    //     return data
    // }

    public async getOrCreateKey (id_server: number, key: string): Promise<KeyType> {
        // const data = querystring.stringify({ id_server })
        const res = await axios.get<KeyType>(`${this._url}${ApiEndpoints.GET_OR_CREATE_KEY}${id_server}`, { headers: this.getHeaders(key) })
        return res.data
    }

    // TODO
    // public async getInvoice (tariffId: string, tokenAddress: string, userAddress: string): Promise<any> {
    //     const res = await axios.get<any>(
    //         `${this._url}${ApiEndpoints.CREATE_TRANSACTION}?tariffId=${tariffId}&tokenAddress=${tokenAddress}&userAddress=${userAddress}`,
    //         { headers: this.getHeaders() }
    //     )
    //     return res.data
    // }
}
