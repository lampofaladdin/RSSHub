import { config } from '@/config';
import logger from '@/utils/logger';
import axios from 'axios';

const instance = axios.create({
    timeout: config.requestTimeout,
    headers: {
        'user-agent': config.ua,
    },
});

// Add request retry functionality
instance.interceptors.response.use(undefined, async (error) => {
    const { config: axiosConfig } = error;
    if (!axiosConfig || !config.requestRetry) {
        throw error;
    }

    // Set retry count if not already set
    axiosConfig.retryCount = axiosConfig.retryCount || 0;

    // Check if we should retry
    if (axiosConfig.retryCount >= config.requestRetry) {
        throw error;
    }

    // Increase retry count
    axiosConfig.retryCount++;

    logger.error(`Request ${axiosConfig.url} fail: ${error.message}, retrying (${axiosConfig.retryCount}/${config.requestRetry})`);

    // Delay before retrying
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Retry request
    return instance(axiosConfig);
});

export default instance;
