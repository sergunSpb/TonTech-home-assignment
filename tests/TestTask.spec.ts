import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address,Cell, toNano } from '@ton/core';
import { TestTask } from '../wrappers/TestTask';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { Opcodes } from '../wrappers/constants';

describe('TestTask', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestTask');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testTask: SandboxContract<TestTask>;
    let guarantor: SandboxContract<TreasuryContract>;
    let price: bigint = toNano(100000);

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        guarantor = await blockchain.treasury('guarantor');
        deployer = await blockchain.treasury('deployer');

        testTask = blockchain.openContract(TestTask.createFromConfig({
            price :price,
            royaltee: 2,
            guarantor : guarantor.address,
            seller: deployer.address
        }, code));

        

        const deployResult = await testTask.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testTask.address,
            deploy: true,
            success: false
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testTask are ready to use
    });

    it('should deposit TON', async () => {
        blockchain.now = 1800000000;
        let buyer = await blockchain.treasury('buyer');

        const depositResult = await testTask.sendMessage(buyer.getSender(), {
            op: Opcodes.deposit,
            value: price
        })

        expect(depositResult.transactions).toHaveTransaction({
            from: buyer.address,
            to: testTask.address,
            success: true,
            value: price
        })
    });

    it('unknown OP', async () => {
        blockchain.now = 1800000000;
        let buyer = await blockchain.treasury('buyer');

        const depositResult = await testTask.sendMessage(buyer.getSender(), {
            op: Opcodes.unknown,
            value: price
        })

        expect(depositResult.transactions).toHaveTransaction({
            from: buyer.address,
            to: testTask.address,
            exitCode: 105,
        })
    });
});
