export function formatNumber (amount: any) {
    const amountAsNumber = parseFloat(amount)

    if (amountAsNumber > 0.01) {
        const formattedValue = amount.toString()
        const index = formattedValue.indexOf('.')

        if (index !== -1 && formattedValue.length - index > 2) {
            return formattedValue.slice(0, index + 3)
        }
        return formattedValue
    }

    const formattedValue = amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 5 })

    return formattedValue.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '').slice(0, 6)
}
