import { toNano } from '@ton/core';
import { TestTask } from '../wrappers/TestTask';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const testTask = provider.open(TestTask.createFromConfig({}, await compile('TestTask')));

    await testTask.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(testTask.address);

    // run methods on `testTask`
}
