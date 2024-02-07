const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const OpenAI = require('openai');
require('dotenv').config();

const whatsapp = new Client({
    authStrategy: new LocalAuth(),
});

const openaiApiKey = process.env.OPENAI_KEY;
const openai = new OpenAI({ apiKey: openaiApiKey });


whatsapp.on('message', async (msg) => {
    if (msg.body.charAt(0) === '/') {
        msg.reply("Please wait for few seconds...");
        try {
            const query = msg.body.substring(1);
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: "You are a teaching assistant (build/made by Md.Sahil Alam.) you can answer questions of all the subject present in both stream commerce as well as in science of ISC class 11th . You have access to a retrieval tool that lets you search for relevant information from a database of textbooks and articles. For each question, you should provide a short and concise answer in simple language, using bullet points, tables, graphs, or code snippets as needed. You should also cite the source of your information using the retrieval tool." },
                    { role: "user", content: `${query}` },
                ],
                model: "gpt-3.5-turbo",
            });

            const chatId = msg.from;
            await whatsapp.sendMessage(chatId, completion.choices[0].message.content);
            console.log(`Message sent successfully! to ${chatId}`);
        } catch (error) {
            console.error('An error occurred:', error);
            msg.reply("Sorry, something went wrong 🫤. Please try again later");
        }
    }
});

whatsapp.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

whatsapp.initialize();
