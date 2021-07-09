import { BigInt, Address } from "@graphprotocol/graph-ts"
import { VEN, Transfer, Approval } from "../generated/VEN/VEN"
import { getOrCreateAccount } from "./common"
import { 
  Account,
  Approval as approvalEntity,
  Contract,
  Transaction 
} from "../generated/schema"



export function handleTransfer(event: Transfer): void {
  let contractId = event.address.toHexString()
  let contractInstance = VEN.bind(event.address)
  let contract = Contract.load(contractId)
  if(contract == null){
    contract = new Contract(contractId)
    let tryContractName = contractInstance.try_name()
    if(!tryContractName.reverted){
      contract.name = tryContractName.value
    }
    let tryTotalSupply = contractInstance.try_totalSupply()
    if(!tryTotalSupply.reverted){
      contract.totalSupply = tryTotalSupply.value
    }
    let tryDecimals = contractInstance.try_decimals()
    if(!tryDecimals.reverted){
      contract.decimals = tryDecimals.value
    }
    let tryOwner = contractInstance.try_owner()
    if(!tryOwner.reverted){
      contract.owner = tryOwner.value
    }
    let trySymbol = contractInstance.try_symbol()
    if(!trySymbol.reverted){
      contract.symbol = trySymbol.value
    }
    contract.save()
  }

  let to = getOrCreateAccount(event, event.params._to).id
  let from = getOrCreateAccount(event, event.params._from).id
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let transaction = Transaction.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (transaction == null) {
    transaction = new Transaction(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    transaction.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  transaction.count = BigInt.fromI32(1).plus(transaction.count)

  // Entity fields can be set based on event parameters
  transaction._from = from
  transaction._to = to
  transaction.amount = event.params._value
  transaction.transactionHash = event.transaction.hash
  transaction.gasUsed = event.transaction.gasUsed
  transaction.gasPrice = event.transaction.gasPrice
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.transactionIndexInBlock = event.transactionLogIndex

  // Entities can be written to the store with `.save()`
  transaction.save()

 
}


export function handleApproval(event: Approval): void {}
