const url = require('url')
const http = require('http')
const fs = require('fs')
require('dotenv').config()
const {
	getData,
	nuevoGasto,
	getId,
	calcular,
	jsonHandler,
} = require('./getdata')
const { asyncReadFile, asyncWriteFile } = require('./asyncFunctions')
const mailer = require('./mailer')

const port = process.env.PORT

http
	.createServer(async (req, res) => {
		const urlParse = url.parse(req.url, true)
		if (urlParse.pathname === '/') {
			res.writeHead(200, { 'Content-Type': 'text/html' })
			asyncReadFile('index.html')
				.then((data) => {
					res.end(data)
				})
				.catch((err) => {
					res.writeHead(500)
					res.end(`Error: ${err}`)
				})
		}
		if (urlParse.pathname.includes('/roommate') && req.method == 'GET') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			asyncReadFile('roommates.json')
				.then((data) => {
					res.end(data)
				})
				.catch((err) => {
					res.writeHead(500)
					res.end(`Error: ${err}`)
				})
		}
		if (urlParse.pathname.includes('/roommate') && req.method == 'POST') {
			const roomMatesJson = jsonHandler('roommates.json')
			let roomMate = roomMatesJson.roommates
			const gastosJSON = jsonHandler('gastos.json')
			let gasto = gastosJSON.gastos
			getData()
				.then((user) => {
					roomMate.push(user)
					calcular(gasto, roomMate)
					fs.writeFileSync('roommates.json', JSON.stringify(roomMatesJson))
					res.writeHead(200)
					res.end(JSON.stringify(user))
				})
				.catch((error) => {
					res.writeHead(500)
					res.end(error)
				})
		}
		if (urlParse.pathname.includes('/gastos') && req.method == 'GET') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			asyncReadFile('gastos.json')
				.then((data) => {
					res.end(data)
				})
				.catch((err) => {
					res.writeHead(500)
					res.end(`Error: ${err}`)
				})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'POST') {
			const roomMatesJson = jsonHandler('roommates.json')
			let roomMate = roomMatesJson.roommates
			const gastosJSON = jsonHandler('gastos.json')
			let gasto = gastosJSON.gastos
			let body
			req.on('data', (payload) => {
				body = JSON.parse(payload)
			})
			req.on('end', () => {
				nuevoGasto(body)
					.then(async(nuevoGasto) => {
						gasto.push(nuevoGasto)
						const roomMateEmail = ["palomaconbotas@yahoo.com", ...roomMate.map(mate => mate.correo)].join()
						calcular(gasto, roomMate)
						await mailer(roomMateEmail.split(','), 'nuevo gasto', 'nuevo gasto').then((data) => console.log(data))
						.catch((err) => console.log(err))
						fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON))
						fs.writeFileSync('roommates.json', JSON.stringify(roomMatesJson))
						res.writeHead(200)
						res.end()
					})
					.catch((error) => {
						res.writeHead(500)
						res.end(error)
					})
			})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'PUT') {
			const roomMatesJson = jsonHandler('roommates.json')
			let roomMate = roomMatesJson.roommates
			const gastosJSON = jsonHandler('gastos.json')
			let gasto = gastosJSON.gastos
			const id = getId(urlParse)
			let body
			req.on('data', (payload) => {
				body = JSON.parse(payload)
				body.id = id
				console.log(body)
			})
			req.on('end', () => {
				gastosJSON.gastos = gasto.map((g) => {
					if (g.id === body.id) {
						return body
					}
					return g
				})
				calcular(gasto, roomMate)
				fs.writeFileSync('roommates.json', JSON.stringify(roomMatesJson))
				asyncWriteFile('gastos.json', JSON.stringify(gastosJSON))
					.then(() => {
						res.end()
					})
					.catch((error) => {
						res.writeHead(500)
						res.end(error)
					})
				res.end()
			})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'DELETE') {
			const gastosJSON = jsonHandler('gastos.json')
			let gasto = gastosJSON.gastos
			const id = getId(urlParse)
			gastosJSON.gastos = gasto.filter((g) => g.id !== id)
			asyncWriteFile('gastos.json', JSON.stringify(gastosJSON))
				.then(() => {
					res.end()
				})
				.catch((error) => {
					res.writeHead(500)
					res.end(error)
				})
			res.end()
		}
	})
	.listen(port, () => {
		console.log(`Server running at http://localhost:${port}`)
	})
