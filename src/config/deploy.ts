export default {
    mountpoint:"/webmail/api",
    oauthUrl: "https://maxiemgeldhof.com/oauth",
    databaseUrl: "mongodb://localhost:27017/mail",
    oauth_credentials: {
        client_secret: "cf93ec4f-a7ad-4ddf-aeaf-d1a19a9a8c13",
        client_name: "oauth"
    },
    port: process.env.PORT || 9125
}