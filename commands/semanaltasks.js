const { SlashCommandBuilder } = require('@discordjs/builders');
const addSheet = require('../Drive/spreadsheets');

//Export command created for use through the BOT
module.exports = {
    data: new SlashCommandBuilder()
        .setName('semanaltasks')
        .setDescription('Le as mensagens até a data especificada e cria um documento')
        .addStringOption(option =>
            option.setName('data')
                .setDescription('Data da última reunião no formato dd/mm/aaaa')
                .setRequired(true)),
    async execute(interaction) {
        //Getting date passed by the user that calls the command
        const date = interaction.options.getString('data');
        //verify date passed, then execute the main instructions
        await verifyDate(interaction, date);      
    }
};

//verify date format recieved by user
async function verifyDate(interaction, date){
    
    //Shows "O bot está pensando.."
    await interaction.deferReply();

    try {
        //pattern date
        const regex_date = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;

        //verify pattern date
        if(!regex_date.test(date) || parseInt(date.slice(0,2)) > 31 || parseInt(date.slice(3,5)) > 12)
            throw new Error('formato de data inválido!');    

        else{
            //format date
            date = date.slice(6,10) + "/" + date.slice(3,5) + "/" + date.slice(0, 2);

            //filter messages according to date and call a function that add messages to spreadsheets
            await filteringMessages(date);
        }

       //When everything goes well, execute this that response a positive message in Discord  
       await interaction.editReply("Planilha atualizada!");

    } catch (err) {
        //Print the error recieved
        console.log(err);
        //response to bot a bad message for date format passed
        await interaction.editReply("Formato de data inválido");
    }
    
}

//Function that filter messages before add to sheet
async function filteringMessages(date){
    //get messages to filter
    const messages = require("../index");

    //create a date object that can compared with other dates
    date = new Date(date);

    //goes through all messages
    for(i = 0; i < messages.length; i++){
        //verify if date message is latter than date parameter passed by the user
        if(messages[i].data > date.getTime()){


            let username = messages[i].usr;

            //get index of position the words "To Do"
            let itodo = messages[i].content.indexOf("To Do");

            //get index of position the words "Done"
            let idone = messages[i].content.indexOf("Done");

            //verify wich occurs firts, "To Do" or "Done"
            if(itodo > idone){
                var done = messages[i].content.slice(0, itodo);
                var todo = messages[i].content.slice(itodo);
            } else {
                var todo = messages[i].content.slice(0, idone);
                var done = messages[i].content.slice(idone);
            }

            //update date format to send for spreadsheet
            let data = formatarData(messages[i].data);

            //call function that add data of message to spreadsheet
            await addSheet(username, todo, done, data);
        }
    }
}

//Format date like that: Ex: 05/03/2022
function formatarData(date){
    
    date = new Date(date);

    //verify if part of date needs a 0 before number
    const addZero = (num) => {
        if (num < 10)
            return "0" + num;
        return num;
    }

    //returns date formated
    return (addZero(date.getDate()).toString() + "/" + addZero(date.getMonth() + 1).toString() + "/" + date.getFullYear().toString());
}