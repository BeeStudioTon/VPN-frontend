export interface TransactionType {
    id: number,
    id_user: number,
    address: string,
    amount: bigint,
    currency: string,
    comment_tr: string,
    reg_date: number,
    hash_tr: string
}
