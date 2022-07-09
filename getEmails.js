/*
https://api.outscraper.com/v1/email?
query=www.kryptowire.com&
query=kududynamics.com&
async=false
*/

const { default: axios } = require("axios")

/**
 *
 * @param {Array<String>} domains
 * @returns
 */
async function getEmailsFromDomain(domain) {
	//? app.outscraper.com?query=1&query=2&query=3
	var host = new URL(domain.website).hostname

	var url = "https://api.app.outscraper.com/emails-and-contacts"
	console.log(url)
	console.log(host)
	axios
		.get(url, {
			headers: {
				"X-API-KEY": process.env.OUTSCRAPERKEY,
			},
			params: {
				query: host,
				async: false,
			},
		})
		.then(function (response) {
			console.log(response.data)
			var emailList = []
			if (response.data.data[0].emails) {
				response.data.data[0].emails.forEach((element) => emailList.push(element.value))
			}

			if (response.data.data[0]["external_emails"]) {
				response.data.data[0]["external_emails"].forEach((element) => emailList.push(element.value))
			}

			//! database.update(domain.placeID, { emails: response.data })
		})
}

async function getEmails(domains) {
	for (var i = 0; i < domains.length; i++) {
		getEmailsFromDomain(domains[i])
	}
}
module.exports = { getEmails }
