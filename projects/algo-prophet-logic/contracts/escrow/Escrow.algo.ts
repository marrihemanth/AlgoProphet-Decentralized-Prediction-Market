import { Contract } from '@algorandfoundation/algorand-typescript/arc4';
import { GlobalState, uint64, assert, gtxn } from '@algorandfoundation/algorand-typescript';
import { Global } from '@algorandfoundation/algorand-typescript/op';
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4';

/**
 * AlgoProphet Escrow Contract
 * Holds collateral for open orders and prize pool for resolved markets.
 */
export class Escrow extends Contract {
  marketAppId = GlobalState<uint64>({ initialValue: 0 })

  @abimethod()
  initialize(marketId: uint64): void {
    this.marketAppId.value = marketId;
  }

  @abimethod()
  deposit(payment: gtxn.PaymentTxn): void {
    assert(payment.receiver === Global.currentApplicationAddress, 'Payment must be to escrow');
  }

  @abimethod()
  claim(): void {
    assert(this.marketAppId.value > 0, 'Market not initialized');
  }
}
