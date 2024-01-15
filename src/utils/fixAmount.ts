import { fromNano } from '@ton/core'

export function fixAmount (nanoAmount: string | number): string {
    const coin = nanoAmount.toString()

    const amount = fromNano(Number(coin))?.toString()

    let stringAmount = Number(amount).toFixed(2)

    if (Number(stringAmount) === 0) {
        stringAmount = Number(amount).toFixed(4)
    }

    return stringAmount
}
