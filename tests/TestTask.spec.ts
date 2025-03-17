import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TestTask } from '../wrappers/TestTask';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TestTask', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestTask');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testTask: SandboxContract<TestTask>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        testTask = blockchain.openContract(TestTask.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await testTask.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testTask.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testTask are ready to use
    });
});
