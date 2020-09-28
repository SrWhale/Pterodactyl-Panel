const { readdirSync, readdir } = require('fs');

const fs = require('fs');

const { Client } = require('discord.js');

const PteroEmbed = require('./PteroEmbed');

const path = require('path');

module.exports = class Pterodactyl extends Client {
    constructor() {
        super();

        this.commands = [];

        this.events = [];

        this.embed = PteroEmbed;


    }

    login() {
        return super.login(process.env.TOKEN);
    }

    loadCommands(dir) {

        readdir(dir, (err, files) => {
            if (!files) return console.log(`[Comandos] Não foi encontrado nenhum comando no local especificado.`)
            if (err) return console.log(`[Comandos] Ocorreu um erro ao carregar os comandos: ${err}.`);


            files.forEach((file) => {
                if (!file.endsWith('.js')) return;

                const filepath = path.join(dir, file);
                fs.stat(filepath, (err, stats) => {
                    if (stats.isDirectory()) {
                        this.loadPath(filepath)

                    } else if (stats.isFile() && file.endsWith('.js')) {
                        const name = file.replace('.js', '');
                        const command = new (require("../../" + filepath))(this);

                        this.commands.push(command)

                    }
                })

            })
        })
        return true;
    }

    loadListeners(dir) {

        readdir(dir, (err, files) => {
            if (!files) return console.log(`[EVENTOS] Não foi encontrado nenhum evento no local especificado.`)
            if (err) console.log(`[Eventos] erro no carregamento do PATH Listenrs: ${err}`);

            files.forEach(file => {
                if (!file.endsWith('.js')) return;
                const event = new (require(`../events/${file}`))(this);
                const eventName = file.split('.')[0];

                console.log(`[LISTENERS] Evento ${eventName} carregado com sucesso.`);

                super.on(eventName, (...args) => event.run(...args));
                this.events.push(event)
            })
        })
        return true;
    }


    async getPrefix(guild) {

        const ref = await this.database.ref(`Pterodactyl/servidores/${guild}/config`).once('value');

        return ref.val() ? ref.val().prefix : null
    }

    connectDatabase() {
        const firebase = require('firebase');
        const firebaseConfig = {
            apiKey: process.env.FIREBASE_KEY,
            authDomain: process.env.FIREBASE_APP_DOMAIN,
            databaseURL: process.env.FIREBASE_DATABASE_URL,
            projectId: process.env.FIREBASE_PROJECTID,
            storageBucket: process.env.FIREBASE_STORAGEBUCKET,
            messagingSenderId: process.env.FIREBASE_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
            measurementId: process.env.FIREBASE_MEASURE
        };

        firebase.initializeApp(firebaseConfig);

        this.database = firebase.database();
        console.log(`[BANCO DE DADOS] Banco de Dados conectado com sucesso.`)
    }
}