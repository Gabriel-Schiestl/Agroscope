import { stopContainer } from './postgres-container';

export default async function globalTeardown(): Promise<void> {
    await stopContainer();
}
