import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type TestTaskConfig = {};

export function testTaskConfigToCell(config: TestTaskConfig): Cell {
    return beginCell().endCell();
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
}
