import { Contract } from '@algorandfoundation/algorand-typescript/arc4';
import { GlobalState, uint64, BoxMap, assert, clone, log } from '@algorandfoundation/algorand-typescript';
import { abimethod, Struct, Address, Bool, Uint64 } from '@algorandfoundation/algorand-typescript/arc4';
import { Txn } from '@algorandfoundation/algorand-typescript/op';

export class Order extends Struct<{
  owner: Address;
  isYes: Bool;
  price: Uint64;
  amount: Uint64;
}> {}

/**
 * AlgoProphet Orderbook Contract
 * Implements a price-time priority limit order book for prediction market shares.
 */
export class Orderbook extends Contract {
  totalOrders = GlobalState<uint64>({ initialValue: 0 })

  orders = BoxMap<uint64, Order>({ keyPrefix: 'o' })

  @abimethod()
  placeOrder(isYes: boolean, price: uint64, amount: uint64): void {
    let matchKey: uint64 = 0;
    let foundMatch = false;

    // Search for a matching counter-party order
    for (let i: uint64 = 0; i < this.totalOrders.value; i++) {
      if (this.orders(i).exists) {
        const order = clone(this.orders(i).value);
        if (order.native.price.asUint64() === price && order.native.isYes.native !== isYes) {
          matchKey = i;
          foundMatch = true;
          break;
        }
      }
    }

    if (foundMatch && this.orders(matchKey).exists) {
      this.orders(matchKey).delete();
      log('Order Matched');
    } else {
      const orderId = this.totalOrders.value;
      
      // Create new order inline to avoid multiple references
      this.orders(orderId).value = new Order({
        owner: new Address(Txn.sender),
        isYes: new Bool(isYes),
        price: new Uint64(price),
        amount: new Uint64(amount)
      });

      this.totalOrders.value = orderId + 1;
    }
  }

  @abimethod()
  cancelOrder(orderId: uint64): void {
    assert(this.orders(orderId).exists, 'Order does not exist');
    const order = clone(this.orders(orderId).value);
    assert(order.native.owner.native.bytes === Txn.sender.bytes, 'Only owner can cancel');
    
    this.orders(orderId).delete();
  }
}

