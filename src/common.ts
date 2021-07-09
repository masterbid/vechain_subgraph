import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts"
import { VEN } from "../generated/VEN/VEN"
import {
    Account,
    Approval as approvalEntity
} from "../generated/schema"

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export function getOrCreateAccount(event: ethereum.Event, address: Address): Account {
    let addressHex = address.toHexString()
    let account = Account.load(addressHex)
    let contractInstance = VEN.bind(event.address)
    if (account != null) {
        return account as Account
    }
    account = new Account(addressHex)
    let tryBalance = contractInstance.try_balanceOf(address)
    if(!tryBalance.reverted){
        account.balance = tryBalance.value
    }
    account.save()
    return account as Account
}

