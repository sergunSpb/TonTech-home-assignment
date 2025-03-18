import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address,Cell, toNano } from '@ton/core';
import { TestTask } from '../wrappers/TestTask';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { Opcodes } from '../wrappers/constants';

const PRICE = toNano(100000);
const ROYALTIEE = 250;
const FEE = (PRICE * BigInt(ROYALTIEE)) / 10000n;

describe('TestTask', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestTask');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testTask: SandboxContract<TestTask>;
    let guarantor: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        guarantor = await blockchain.treasury('guarantor');
        deployer = await blockchain.treasury('deployer');

        testTask = blockchain.openContract(TestTask.createFromConfig({
            price : PRICE,
            royaltee: ROYALTIEE,
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
        let storage = await testTask.getStorage();
        expect(storage.seller).toEqual(deployer.address);

        console.log(await testTask.getStorage())
    });

    it('should deposit TON', async () => {
        let buyer = await blockchain.treasury('buyer');

        const depositResult = await testTask.sendMessage(buyer.getSender(), {
            op: Opcodes.deposit,
            value: PRICE
        });

        expect(depositResult.transactions).toHaveTransaction({
            from: buyer.address,
            to: testTask.address,
            success: true,
            value: PRICE
        });       
    });

    it('confirm transaction', async () => {
        let buyer = await blockchain.treasury('buyer');

        const depositResult = await testTask.sendMessage(guarantor.getSender(), {
            op: Opcodes.confirm_deal,
            value: toNano(0),
        });

        expect(depositResult.transactions).toHaveTransaction({
            from: testTask.address,
            to: deployer.address,
            success: true,
            value: PRICE
        });

        expect(depositResult.transactions).toHaveTransaction({
            from: testTask.address,
            to: guarantor.address,
            success: true,
            value: FEE
        });
    });

    it('unknown OP', async () => {
        let buyer = await blockchain.treasury('buyer');

        const depositResult = await testTask.sendMessage(buyer.getSender(), {
            op: Opcodes.unknown,
            value: PRICE
        });

        expect(depositResult.transactions).toHaveTransaction({
            from: buyer.address,
            to: testTask.address,
            exitCode: 105,
        });
    });
});
