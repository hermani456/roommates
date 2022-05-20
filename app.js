const url = require('url')
const http = require('http')
const fs = require('fs')
const { getData, nuevoGasto, getId, calcular } = require('./getdata')
const { asyncReadFile, asyncWriteFile } = require('./asyncFunctions')

const port = 3000

http
	.createServer(async (req, res) => {
		const urlParse = url.parse(req.url, true)
		const gastosJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'))
		let gasto = gastosJSON.gastos
		const roomMatesJson = JSON.parse(fs.readFileSync('roommates.json', 'utf8'))
		let roomMate = roomMatesJson.roommates
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
					res.writeHead(404)
					res.end(`Error: ${err}`)
				})
		}
		if (urlParse.pathname.includes('/roommate') && req.method == 'POST') {
			// const roomMates = JSON.parse(fs.readFileSync('roommates.json', 'utf8'))
			// const roomMate = roomMates.roommates
			getData().then((user) => {
				roomMate.push(user)
				calcular(gasto, roomMate)
				fs.writeFileSync('roommates.json', JSON.stringify(roomMatesJson))
				res.writeHead(200)
				res.end(JSON.stringify(user))
			})
			// .catch((error) => {
			// 	res.writeHead(500)
			// 	res.end(error)
			// })
		}
		if (urlParse.pathname.includes('/gastos') && req.method == 'GET') {
			res.writeHead(200, { 'Content-Type': 'application/json' })
			asyncReadFile('gastos.json')
				.then((data) => {
					res.end(data)
				})
				.catch((err) => {
					res.writeHead(404)
					res.end(`Error: ${err}`)
				})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'POST') {
			let body
			req.on('data', (payload) => {
				body = JSON.parse(payload)
			})
			req.on('end', () => {
				nuevoGasto(body).then((nuevoGasto) => {
					gasto.push(nuevoGasto)
					calcular(gasto, roomMate)
					fs.writeFileSync('gastos.json', JSON.stringify(gastosJSON))
					fs.writeFileSync('roommates.json', JSON.stringify(roomMatesJson))
					res.writeHead(200)
					res.end()
				})
				// .catch((error) => {
				// 	res.writeHead(500)
				// 	res.end(error)
				// })
			})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'PUT') {
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
					.catch((err) => console.log(err)) //error code
				res.end()
			})
		}
		if (urlParse.pathname.includes('/gasto') && req.method == 'DELETE') {
			const id = getId(urlParse)
			gastosJSON.gastos = gasto.filter((g) => g.id !== id)
			asyncWriteFile('gastos.json', JSON.stringify(gastosJSON))
				.then(() => {
					res.end()
				})
				.catch((err) => console.log(err)) //error code
			res.end()
		}
	})
	.listen(port, () => {
		console.log(`servidor corriendo en: http://localhost:${port}`)
	})
