import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('schedulerState');

class SchedulerState {
    private static instance: SchedulerState;
    private runningTasks: Set<string> = new Set();

    private constructor() {}

    public static getInstance(): SchedulerState {
        if (!SchedulerState.instance) {
            SchedulerState.instance = new SchedulerState();
        }
        return SchedulerState.instance;
    }

    public async runTask<T>(taskName: string, task: () => Promise<T>): Promise<T | undefined> {
        if (this.runningTasks.has(taskName)) {
            logger.warn(`Task ${taskName} already running, skipping`);
            return;
        }

        this.runningTasks.add(taskName);
        try {
            logger.info(`Starting task ${taskName}`);
            const result = await task();
            logger.info(`Completed task ${taskName}`);
            return result;
        } catch (error) {
            logger.error({
                error: error instanceof Error ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                } : 'Unknown error',
                taskName
            }, `Error in task ${taskName}`);
            throw error;
        } finally {
            this.runningTasks.delete(taskName);
        }
    }

    public isTaskRunning(taskName: string): boolean {
        return this.runningTasks.has(taskName);
    }

    public getRunningTasks(): string[] {
        return Array.from(this.runningTasks);
    }
}

export const schedulerState = SchedulerState.getInstance(); 