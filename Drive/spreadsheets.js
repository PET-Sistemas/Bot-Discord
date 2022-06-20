const { GoogleSpreadsheet } = require('google-spreadsheet');
//Document that contains credentials for use google-spreadsheet api
const credentials = require('./credentials.json');

const main = async (name, todo, done, date) => {
    try{
        //select correct id spreadsheet
        const docID = await verificaPlanilhaID(date)

        //Create a doc to recieve the spreadsheet
        const doc = new GoogleSpreadsheet(docID);

        //Connect to spreadsheet
        await doc.useServiceAccountAuth(credentials);

        //Get data from spreadsheet
        await doc.loadInfo(); 

        //Acess sheet according to name
        const sheet = doc.sheetsByTitle[name];

        //verify if that sheet exists
        if(sheet){
            //Get data rows in the sheet
            const sheetRows = await sheet.getRows();
            
            //Verify if sheets aren't empty
            if(sheetRows.length > 0){

                //Store date of message passed by the semanaltasks.js
                const dateMessage = date;

                //Update date format to create a new Date object
                date = date.slice(6,10) + "/" + date.slice(3,5) + "/" + date.slice(0, 2);
                const nowDate = new Date(date);

                //Get date of the last row in sheet
                let ldate = sheetRows[sheetRows.length-1].Data;

                //Update date format to create a new Date object
                ldate = ldate.slice(6,10) + "/" + ldate.slice(3,5) + "/" + ldate.slice(0, 2);
                const lastDate = new Date(ldate);

                //verify if date of message passed by semanaltasks.js is latter then last message in sheet
                if(nowDate > lastDate)
                    //Add correct datas to sheet
                    await sheet.addRow({ 'To Do': todo, 'Done': done, 'Data': dateMessage});

            } else {
                //When sheet is empty, only put in sheet the datas
                await sheet.addRow({ 'To Do': todo, 'Done': done, 'Data': date});
            }
        }
    } catch (err){
        console.log(err);
    }
}

//Verify wich spreadsheet id will be used according to date
function verificaPlanilhaID(date){
    if(date.slice(6,10) == '2022'){
        if(parseInt(date.slice(3,5)) < 7)
            return 'id_your_sheet_for_2022-1'
        else
            return 'id_your_sheet_for_2022-2'
    } else if (date.slice(6,10) == '2023'){
        if(parseInt(date.slice(3,5)) < 7)
            return 'id_your_sheet_for_2023-1'
        else
            return 'id_your_sheet_for_2023-2'
    } else {
        console.log('Planilha não criada, atualize imediatamente!')
    }
}


module.exports = main;

