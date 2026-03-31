import { Contract } from '@algorandfoundation/puya-ts'

/**
 * AlgoProphet Escrow Contract
 * Holds collateral for open orders and prize pool for resolved markets.
 *
 * Phase 2 will implement:
 *  - deposit()  → lock ALGO/ASA from order placer
 *  - release()  → pay out winner after resolution
 *  - refund()   → return collateral on order cancel / market void
 */
export class Escrow extends Contract {
  // --- Global State ---
  // totalLocked: GlobalStateKey<uint64>
  // marketAppId: GlobalStateKey<uint64>

  createApplication(): void {
    // TODO Phase 2: initialize escrow
  }
}
