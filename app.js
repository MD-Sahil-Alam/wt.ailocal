// const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const OpenAI = require('openai');
require('dotenv').config();
const http = require('http');

const PORT = 64840;

// Create HTTP server
const server = http.createServer((req, res) => {
    res.end('Hello, World!');
});

// Start HTTP server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



// Function to initialize WhatsApp client
const initializeWhatsApp = async () => {
    try {
        const whatsapp = new Client({
            authStrategy: new LocalAuth({
            }),
        });

        // whatsapp.on('qr', (qr) => {
        //     qrcode.generate(qr, { small: true });
        // });

        const openaiApiKey = process.env.OPENAI_KEY;
        const openai = new OpenAI({ apiKey: openaiApiKey });

        // Handle incoming messages
        whatsapp.on('message', async (msg) => {
            if (msg.body.charAt(0) === '.') {
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
                    console.log(`Message sent successfully to ${chatId}`);
                } catch (error) {
                    console.error('An error occurred:', error);
                    msg.reply("Sorry, something went wrong 🫤. Please try again later");
                }
            }
        });

        // Handle WhatsApp client ready event
        whatsapp.on('ready', async () => {
            console.log('WhatsApp client is ready!');
            // Send keep alive message to the group periodically
            // setInterval(async () => {
            //     try {
            //         await whatsapp.sendMessage('916201818940@c.us', 'we are working');
            //         console.log('Keep alive message sent');
            //     } catch (error) {
            //         console.error('Error sending keep alive message:', error);
            //         // If there's an error sending keep alive message, restart WhatsApp client
            //         console.log('Restarting WhatsApp client...');
            //         restartWhatsApp();
            //     }
            // }, 3 * 60 * 1000); // Send a message every 3 minutes
        });

        // Initialize WhatsApp client
        await whatsapp.initialize();

        // Function to restart WhatsApp client
        const restartWhatsApp = async () => {
            console.log('Restarting WhatsApp client...');
            await initializeWhatsApp(); // Reinitialize WhatsApp client
            console.log('WhatsApp client is ready!');
        };

            // Restart WhatsApp client every 7 minutes
            setInterval(restartWhatsApp, 7 * 60 * 1000);

    } catch (error) {
        console.error('An error occurred during WhatsApp client initialization:', error);
        // Retry initialization after a delay
        // setTimeout(initializeWhatsApp, 30000); // Retry after 30 seconds
    }
};

// Initialize WhatsApp client
initializeWhatsApp();
