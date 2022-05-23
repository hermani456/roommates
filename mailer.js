const nodemailer = require('nodemailer')

function mailer(to, subject, html) {
	return new Promise((resolve, reject) => {
		const transporter = nodemailer.createTransport({
			service: 'yahoo',
			auth: {
				user: 'palomaconbotas@yahoo.com',
				pass: 'kddpoixqhfdwfoqj',
			},
		})
		const mailOptions = {
			from: 'palomaconbotas@yahoo.com',
			to,
			subject,
			html,
		}
		transporter.sendMail(mailOptions, (err, data) => {
			if (err) reject(err)
			if (data) resolve(data)
		})
	})
}

module.exports = mailer