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
  
  let transaction = Transaction.load(event.transaction.from.toHex())

  if (transaction == null) {
    transaction = new Transaction(event.transaction.from.toHex())
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


export function handleApproval(event: Approval): void {
  let spender = getOrCreateAccount(event, event.params._spender).id
  let owner = getOrCreateAccount(event, event.params._owner).id
  let approvalId = owner.concat("-").concat(spender).concat("-").concat(event.block.timestamp.toString())
  let approval = approvalEntity.load(approvalId)
  approval.spender = spender
  approval.owner = owner
  approval.value = event.params._value
  approval.save()
}
