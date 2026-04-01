import { Contract } from '@algorandfoundation/algorand-typescript/arc4';
import { GlobalState, bytes, uint64, assert, Bytes } from '@algorandfoundation/algorand-typescript';
import { Txn } from '@algorandfoundation/algorand-typescript/op';
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4';

/**
 * AlgoProphet Market Contract
 * Manages the full lifecycle of a binary prediction market.
 *
 * createMarket()  → initialize market with a description
 * resolveMarket() → creator-only outcome resolution
 */
export class Market extends Contract {
  creator = GlobalState<bytes>({ initialValue: Bytes() })
  description = GlobalState<string>({ initialValue: '' })
  isResolved = GlobalState<boolean>({ initialValue: false })
  winningOutcome = GlobalState<uint64>({ initialValue: 0 })

  @abimethod()
  createMarket(description: string): void {
    this.creator.value = Txn.sender.bytes;
    this.description.value = description;
  }

  @abimethod()
  resolveMarket(outcome: uint64): void {
    assert(Txn.sender.bytes === this.creator.value, 'Only creator can resolve');
    this.isResolved.value = true;
    this.winningOutcome.value = outcome;
  }
}
