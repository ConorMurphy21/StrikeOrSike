import winston, { LogEntry } from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});
if (process.env.NODE_ENV === 'production') {
  const cloudwatchConfig = {
    logGroupName: 'application/logs',
    logStreamName: 'application/logs-production',
    awsRegion: 'us-west-2',
    messageFormatter: ({ level, message }: LogEntry) => `[${level}] : ${message}`
  };
  logger.add(new WinstonCloudWatch(cloudwatchConfig));
}
export = logger;
