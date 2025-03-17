import { Address, toNano } from '@ton/core';
import { TestTask } from '../wrappers/TestTask';
import { compile, NetworkProvider } from '@ton/blueprint';


const GUARANTOR = Address.parse('0QDF4pWUdqRaUvY2fDAYWnD9nktdttaZHj54YSZ8M4rHC4nx')
const PRICE = toNano(100000)
const ROYALTEE = 2

export async function run(provider: NetworkProvider) {
    const testTask = provider.open(TestTask.createFromConfig({
        guarantor: GUARANTOR,
        price: PRICE,
        royaltee: ROYALTEE, 
        seller: provider.sender().address
    }, await compile('TestTask')));

    await testTask.sendDeploy(provider.sender(), toNano('0'));

    await provider.waitForDeploy(testTask.address);

    // run methods on `testTask`
}
