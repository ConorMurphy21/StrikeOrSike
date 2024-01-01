const IN_PRODUCTION = process.env.NODE_ENV === 'production'

module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}