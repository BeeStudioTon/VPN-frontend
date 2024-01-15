export function calculateDaysFromTimestamp (timestamp: number | undefined): number {
    if (timestamp !== undefined) {
        const currentTimestamp = Math.floor(Date.now() / 1000)
        const remainingSeconds = timestamp - currentTimestamp
        const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24))

        return Math.max(remainingDays, 0)
    }

    return 0
}
