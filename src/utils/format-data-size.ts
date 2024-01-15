export function formatDataSize (sizeInBytes: number): string {
    const sizeInMB = sizeInBytes / (1024 * 1024)
    const sizeInGB = sizeInMB / 1024

    const formattedSize = sizeInGB >= 1 ? `${sizeInGB.toFixed(2)} GB` : `${sizeInMB.toFixed(2)} MB`

    return formattedSize
}
