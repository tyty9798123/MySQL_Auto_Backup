// 引入 node_modules
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
require('dotenv').config()
// 宣告常數
const FILES_DIR = path.join(__dirname, "SQLFiles");
const SECONDS_OF_QUARTER_DAY = 21600; //四分之一天
const SECONDS_OF_A_DAY = 86400;
const SECONDS_OF_A_WEEK = 86400 * 7;

function timeConverter(UNIX_timestamp){  
    var a = new Date(UNIX_timestamp);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear(), month = months[a.getMonth()], date = a.getDate(),
    date = a.getDate(), hour = a.getHours(), min = a.getMinutes(), sec = a.getSeconds();
    if (date < 10){
      date = "0" + date;
    }
    if (sec < 10){
      sec = "0" + sec;
    }
    if (hour < 10){
      hour = "0" + hour;
    }
    if (min < 10){
      min = "0" + min;
    }
    return year + '-' + month + '-' + date + '-' + hour + '-' + min + '-' + sec;
}

function deleteExpiredFiles(current_timestamp, timeExceeded) {
	//至少要達到 atLeastTimestamp，否則不刪
	const atLeastTimestamp = current_timestamp - timeExceeded;
	fs.readdirSync(FILES_DIR).forEach(file => {
		let fileNameNoExtension = file.split(".")[0];
		let fileCreatedTimestamp = Number(fileNameNoExtension.split("-")[6])
		if ( fileCreatedTimestamp < atLeastTimestamp ){
			fs.unlinkSync(path.join(FILES_DIR, file));
			console.log(`FileName: ${fileNameNoExtension} is Deleted.`)
		}
	});
}


setInterval( () => {
	const timestamp = Date.now();
	deleteExpiredFiles(timestamp, SECONDS_OF_A_WEEK * 1000);
	const BACKUP_COMMAND = `mysqldump -u ${process.env.DB_USER} -p${process.env.DB_PASS} --all-databases > ${timeConverter(timestamp)}-${timestamp}.sql`;
	exec(BACKUP_COMMAND, {cwd: FILES_DIR}, function(err, stdout, stderr) {
		console.log("SAVE_FILE_COMPELETE" + `${timeConverter(timestamp)}-${timestamp}.sql`)
	});
}, SECONDS_OF_QUARTER_DAY * 1000)
