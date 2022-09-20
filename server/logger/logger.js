const winston = require('winston'),
    WinstonCloudWatch = require('winston-cloudwatch');
const logger = new winston.createLogger({
    format: winston.format.json(),
    transports: [
        new (winston.transports.Console)({
            timestamp: true,
            colorize: true,
        })
    ]
});
if (process.env.NODE_ENV === 'production') {
    const cloudwatchConfig = {
        logGroupName: 'application/logs',
        logStreamName: 'application/logs-production',
        awsRegion: 'us-west-2',
        messageFormatter: ({
                               level,
                               message,
                           }) => `[${level}] : ${message}`

    }
    logger.add(new WinstonCloudWatch(cloudwatchConfig))
}
module.exports = logger;