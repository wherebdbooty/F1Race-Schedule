// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: flag-checkered;

// Citation and thank yous to the following:
// Scriptable table setup modified from /u/wherebdbooty from this post on reddit: https://old.reddit.com/r/Scriptable/comments/121ewyg/working_with_stacks/jdnsl82/
// F1 race data from the great project jolpica-f1, which took over where ergast left off. Check out that project here: https://github.com/jolpica/jolpica-f1

const dataUrl = "https://api.jolpi.ca/ergast/f1/current/next.json";
const raceIdx = 0
const now = new Date()

let options = {
    width: 175,
    font:{
        header:	new Font("Hiragino Sans W7", 16),
        title:	new Font("Hiragino Sans W7", 10),
        body:	new Font("Hiragino Sans W6", 10)
    }
}

function finished(time){	return time<now?.5:1	}

//// for testing
// const dataUrl = "https://api.jolpi.ca/ergast/f1/current/races.json";// 
// const raceIdx = 4

let widget = await createWidget();
Script.setWidget(widget);
//// for testing
widget.presentMedium() //Small,Medium,Large,ExtraLarge   
Script.complete();

async function formatSessionDay(sessionDay) {
    var options = { weekday: 'short' };
    return sessionDay.toLocaleDateString('en-US', options);
}

async function formatSessionDate(sessionDate) {
    var options = { month: 'numeric', day: 'numeric' };
    return sessionDate.toLocaleDateString('en-US', options);
}

async function formatSessionTime(sessionTime) {
    var options = { hour12: false, hour: '2-digit', minute:'2-digit' };
    return sessionTime.toLocaleTimeString('en-US', options);
}

async function createWidget() {
	const widget = new ListWidget();
	const data = await new Request(dataUrl).loadJSON();
	const race = data.MRData.RaceTable.Races[raceIdx]
	const raceDateTime = new Date(`${race.date}T${race.time}`)
	const fp1 = race.FirstPractice
	const fp1DateTime = new Date(`${fp1.date}T${fp1.time}`)
	const quali = race.Qualifying
	const qualiDateTime = new Date(`${quali.date}T${quali.time}`)

	let sprintQ, fp2sprintQDateTime, sprint, fp3sprintDateTime, fp2, fp3

	let dateTime = []
		dateTime[0] = {
			title:	'FP1',
			day:	await formatSessionDay(fp1DateTime),
			date:	await formatSessionDate(fp1DateTime),
			time:	await formatSessionTime(fp1DateTime),
			raw:	fp1DateTime
		}
		if(Object.hasOwn(race, "Sprint")) {
			dateTime[1] = {title: 'SQ'}
			sprintQ = race.SprintQualifying
			fp2sprintQDateTime = new Date(`${sprintQ.date}T${sprintQ.time}`)

			dateTime[2] = {title: 'SPR'}
			sprint = race.Sprint
			fp3sprintDateTime = new Date(`${sprint.date}T${sprint.time}`)
		} else {
			dateTime[1] = {title: 'FP2'}
			fp2 = race.SecondPractice
			fp2sprintQDateTime = new Date(`${fp2.date}T${fp2.time}`)

			dateTime[2] = {title: 'FP3'}
			fp3 = race.ThirdPractice
			fp3sprintDateTime = new Date(`${fp3.date}T${fp3.time}`)
		}
		dateTime[1].day = await formatSessionDay(fp2sprintQDateTime)
		dateTime[1].date = await formatSessionDate(fp2sprintQDateTime)
		dateTime[1].time = await formatSessionTime(fp2sprintQDateTime)
		dateTime[1].raw = fp2sprintQDateTime

		dateTime[2].day = await formatSessionDay(fp3sprintDateTime)
		dateTime[2].date = await formatSessionDate(fp3sprintDateTime)
		dateTime[2].time = await formatSessionTime(fp3sprintDateTime)
		dateTime[2].raw = fp3sprintDateTime

		dateTime[3] = {
			title:	'Qual',
			day:	await formatSessionDay(qualiDateTime),
			date:	await formatSessionDate(qualiDateTime),
			time:	await formatSessionTime(qualiDateTime),
			raw:	qualiDateTime
		}
		dateTime[4] = {
			title:	'Race',
			day:	await formatSessionDay(raceDateTime),
			date:	await formatSessionDate(raceDateTime),
			time:	await formatSessionTime(raceDateTime),
			raw:	raceDateTime
		}

	const headerStack = widget.addStack()
	const headerText = race.raceName.toUpperCase()
	const headerCell = headerStack.addStack()
		  //headerCell.backgroundColor = HEADER_COLOR
          headerCell.size = new Size(options.width,0)
          headerCell.addSpacer()
      
		  const textElement = headerCell.addText(headerText)
          		textElement.font = options.font.header
          		textElement.minimumScaleFactor = .1
          		textElement.lineLimit = 1

    	  headerCell.addSpacer()

    let body = widget.addStack()
		//change: width,height (0 = auto size)
		body.size = new Size(options.width,0)
		body.cornerRadius = 1

	let maxColumns = 5

	for(let column=0; column<maxColumns; column++){
		let currentColumn = body.addStack()
			currentColumn.layoutVertically()
            
            //adjust column padding
            currentColumn.setPadding(0,-2.5,0,-7.5)
            
		for(let row in dateTime[column]){
			if(row=='raw') continue
			let currentCell = currentColumn.addStack()
				currentCell.addSpacer()
			let cellText = currentCell.addText(dateTime[column][row])
				//if row==0, use title font, else use body font
				cellText.font = !row?options.font.title:options.font.body
				cellText.textColor = Color.white()
				cellText.lineLimit = 1
				cellText.minimumScaleFactor = .2
				cellText.textOpacity = finished(dateTime[column].raw)
			currentCell.addSpacer()
		}
		currentColumn.addSpacer(4)
	}

    return widget;
}
