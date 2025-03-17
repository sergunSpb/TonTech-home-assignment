import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Slice } from '@ton/core';
import { Opcodes } from './constants';

export type TestTaskConfig = {
    guarantor: Address,
    seller?: Address,
    price: bigint,
    royaltee: number, 
};

export function testTaskConfigToCell(config: TestTaskConfig): Cell {
    return beginCell().storeAddress(config.seller).storeUint(0, 2).storeUint(0, 2).storeCoins(config.price).storeUint(config.royaltee,10).storeBit(false).endCell();
}

export class TestTask implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TestTask(address);
    }

    static createFromConfig(config: TestTaskConfig, code: Cell, workchain = 0) {
        const data = testTaskConfigToCell(config);
        const init = { code, data };
        return new TestTask(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMessage(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint;
            op: Opcodes,
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(opts.op, 32).endCell(),
        });
    }

    async deposit(provider: ContractProvider, via: Sender, value: bigint) {
        await this.sendMessage(provider,via,{
            value: value,
            op: Opcodes.unknown
        })
    }
}
