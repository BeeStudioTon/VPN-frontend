/* eslint-disable class-methods-use-this */

import axios, { AxiosResponse } from "axios";

import { UserType, UserTypeUser } from "../@types/user";
import { RatesType } from "../@types/rates";
import { KeyType } from "../@types/get-keys";
import { ServerData } from "../@types/servers";
import { IAuthTokensResponse } from "../@types/auth";

enum ApiEndpoints {
    TELEGRAM_LOGIN = "auth/telegram/login",
    JWT_REFRESH = "auth/jwt/refresh",
    GET_USER = "user",
    GET_INVOICE_LIST = "invoice/list",
    CREATE_INVOICE = "invoice/create",
    GET_KEY_LIST = "key/list",
    GET_OR_CREATE_KEY = "key/getOrCreate/",
    CREATE_KEY = "key/create",
    GET_SERVER_LIST = "server/list",
    GET_SUBSCRIBE_LIST = "subscribe/list",
    GET_IP = "ping/ip",
    CREATE_INVOICE_TELEGRAM = "invoice/createTg",
    USER_ME = "user/",
}

export class VPN {
    private _url: string = "https://api.beevpn.pro/";
    // private _url: string = 'https://localhost:3001/'

    private getHeaders(key?: string | undefined) {
        return key ? { Authorization: `Bearer ${key}` } : {};
    }

    public async postAuth(key: string): Promise<UserType> {
        const res = await axios.get<UserType>(
            `${this._url}${ApiEndpoints.GET_USER}`,
            { headers: this.getHeaders(key) }
        );
        return res.data;
    }

    public async refreshJWT(
        key: string,
        keyRefresh: string
    ): Promise<IAuthTokensResponse | Error> {
        try {
            const res = await axios.post<IAuthTokensResponse>(
                `${this._url}${ApiEndpoints.JWT_REFRESH}`,
                { accessToken: key, refreshToken: keyRefresh },
                { headers: this.getHeaders() }
            );
            return res.data;
        } catch (error: any) {
            console.error('refreshJWT', error)
            return new Error(error);
        }
    }

    public async telegramLogin(
        init: string
    ): Promise<IAuthTokensResponse | Error> {
        try {
            const res = await axios.post<IAuthTokensResponse>(
                `${this._url}${ApiEndpoints.TELEGRAM_LOGIN}`,
                { webAppInitData: init },
                {
                    headers: this.getHeaders(),
                    validateStatus: (status) => true,
                }
            );
            console.log("res============================", res);
            return res.data;
        } catch (error: any) {
            console.log("error==========");
            return new Error(error);
        }
    }

    public async getServers(key: string): Promise<ServerData[]> {
        const res = await axios.get<{ list: ServerData[] }>(
            `${this._url}${ApiEndpoints.GET_SERVER_LIST}?skip=0&take=50`,
            { headers: this.getHeaders(key) }
        );
        return res.data.list;
    }

    public async getRates(key: string): Promise<RatesType[]> {
        const res = await axios.get<{ list: RatesType[] }>(
            `${this._url}${ApiEndpoints.GET_SUBSCRIBE_LIST}?skip=0&take=50`,
            { headers: this.getHeaders(key) }
        );
        return res.data.list;
    }

    public async getKeys(key: string): Promise<KeyType[]> {
        const res = await axios.get<{ list: KeyType[] }>(
            `${this._url}${ApiEndpoints.GET_KEY_LIST}?skip=0&take=50`,
            { headers: this.getHeaders(key) }
        );
        return res.data.list;
    }

    public async getUser(key: string): Promise<UserTypeUser | Error> {
        try {
            const res = await axios.get<UserTypeUser>(
                `${this._url}${ApiEndpoints.USER_ME}`,
                { headers: this.getHeaders(key) }
            );
            return res.data;
        } catch (error: any) {
            console.error("getUser:", error);
            return new Error(error);
        }
    }

    public async getIp(): Promise<string> {
        const res = await axios.get<{ ip: string }>(
            `${this._url}${ApiEndpoints.GET_IP}`,
            { headers: this.getHeaders() }
        );
        return res.data.ip;
    }

    // TODO
    // public async activateFree (): Promise<any> {
    //     const data = await this.post<any>(ApiEndpoints.ACTIVATE_FREE, { tg_data: window.Telegram.WebApp.initData })
    //     return data
    // }

    public async getOrCreateKey(
        id_server: number,
        key: string
    ): Promise<KeyType> {
        // const data = querystring.stringify({ id_server })
        const res = await axios.get<KeyType>(
            `${this._url}${ApiEndpoints.GET_OR_CREATE_KEY}${id_server}`,
            { headers: this.getHeaders(key) }
        );
        return res.data;
    }

    public async createInvoiceTelegram(
        sub_id: string,
        key: string
    ): Promise<string> {
        const res = await axios.post<string>(
            `${this._url}${ApiEndpoints.CREATE_INVOICE_TELEGRAM}`,
            { subscribeIdStr: Number(sub_id) },
            { headers: this.getHeaders(key) }
        );
        return res.data;
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
