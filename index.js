// Example of use:
// > node index.js "url/to/xml"

const { parseString } = require('xml2js');
const xmlUrl = process.argv[2];
(async () => {
	const response = await fetch(xmlUrl);
	const responseText = await response.text();
	parseString(responseText, (error, result) => {
		if (error) {
			console.error(error);
			return;
		}
		const todayActivity = result.feed.entry
			.filter(function checkToday(entry) {
				const updated = new Date(entry.updated);
				const now = new Date();
				const isToday = now.getFullYear() === updated.getFullYear() &&
					now.getMonth() === updated.getMonth() &&
					now.getDate() === updated.getDate();
				return isToday;
			})
			.reduce(function assembleObjectWithoutDuplicates(acc, entry) {
				const [ entryTitle ] = entry.title;
				const [ project ] = entryTitle.split(' - ');
				const ticket = entryTitle.match(/#\d+/)[0].replace('#', '');
				const title = entryTitle.slice(entryTitle.indexOf(': ') + 2); // 2 is length of ': '
				if (!acc[project]) {
					acc[project] = {};
				}
				if (!acc[project][ticket]) {
					acc[project][ticket] = title;
				}
				return acc;
			}, {});
		let report = '';
		for (const [project, projectActivity] of Object.entries(todayActivity)) {
			report += `   ${project}\n`;
			for (const [ticket, title] of Object.entries(projectActivity)) {
				report += `- ${ticket} - ${title}\n`;
			}
			report += '\n';
		}
		console.log(report);
	});
})();

