/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address, Builder, Cell, toNano, TonClient4, JettonMaster, beginCell, TonClient } from '@ton/ton'

export interface TransferOptions {
    queryId?: number | bigint,
    tokenAmount: bigint,
    to: Address,
    responseAddress: Address,
    fwdAmount?: bigint,
    fwdBody?: Cell,
    comment?: string
}

export interface TransToSignJetton {
    to: string
    amount: string
    comment?: string | undefined
}

function newQueryId (): number {
    return ~~(Date.now() / 1000)
}

const WALLET_OP = {
    burn_query: 0x3a3b4252,
    transfer_query: 0xf8a7ea5,
    bouncable_transfer_query: 0x3a81b46
}

export function buildTransferMessage (options: TransferOptions): Cell {
    const {
        queryId = newQueryId(),
        tokenAmount,
        to,
        responseAddress,
        fwdAmount = toNano(0.01)
        // fwdBody = new Builder().cell()
    } = options

    const op = WALLET_OP.transfer_query

    // transfer_query or bouncable_transfer_query
    const body = new Builder()
        .storeUint(op, 32)                  // op
        .storeUint(queryId, 64)             // query_id
        .storeCoins(tokenAmount)            // token_amount
        .storeAddress(to)                   // to_address
        .storeAddress(responseAddress)      // response_address
        .storeBit(0)                        // custom_payload:(Maybe ^Cell)
        .storeCoins(fwdAmount)              // fwd_amount

    const fwdBody = options.comment
        ? new Builder().storeUint(0, 32).storeStringRefTail(options.comment ?? '').endCell()
        : new Builder().endCell()

    if (body.bits + fwdBody.bits.length > 1023) {
        body.storeBit(1).storeRef(fwdBody)
    } else {
        body.storeBit(0).storeSlice(fwdBody.asSlice())
    }

    return body.asCell()
}

export function sendJettonToBoc (tr: TransToSignJetton, addressUser: string): string {
    const transJetton: TransferOptions = {
        queryId: 1,
        tokenAmount: BigInt(tr.amount),
        to: Address.parse(tr.to), // to address
        responseAddress: Address.parse(addressUser.toString()),
        comment: tr.comment
    }

    const boc = buildTransferMessage(transJetton)

    const base64 = boc.toBoc().toString('base64')
    console.log('base64:', base64)
    return base64
}

const client = new TonClient4({ endpoint: 'https://tonclient4.delabteam.com' })

const standbyV2Client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
    apiKey: '94d8d3dde3b37be15e77baf5c3800bcafc5dcb8ec9f50c6b14bb8ed9fd79cb62'
})

export async function resolveJettonAddressFor (
    jettonMasterAddress: string,
    userContractAddress: string
): Promise<string | undefined> {
    try {
        const jettonMaster = client.open(JettonMaster.create(Address.parse(jettonMasterAddress)))
        const address = await jettonMaster.getWalletAddress(Address.parse(userContractAddress))
        return address.toString()
    } catch (err) {
        // standbyV2Client
        const waletAddress = await standbyV2Client.runMethod(Address.parse(jettonMasterAddress), 'get_wallet_address', [
            { type: 'slice', cell: beginCell().storeAddress(Address.parse(userContractAddress)).endCell() }
        ])
        try {
            const cell = waletAddress.stack.readCell()
            const address = cell.beginParse().loadAddress()
            return address.toString()
        } catch {
            console.error(err)
            return undefined
        }
    }
}
