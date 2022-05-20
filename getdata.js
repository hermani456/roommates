const axios = require('axios')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')

const url = 'https://randomuser.me/api/'

const getData = async () => {
	try {
		const { data } = await axios.get(url)
		const { first, last } = data.results[0].name
		const user = {
			id: uuidv4().slice(30),
			nombre: `${first} ${last}`,
			debe: 0,
			recibe: 0,
			total: 0,
			correo: data.results[0].email,
		}
		return user
	} catch (error) {
		console.log(error)
	}
}

const nuevoGasto = async (body) => {
	try {
		const nuevoGasto = {
			id: uuidv4().slice(30),
			roommate: body.roommate,
			descripcion: body.descripcion,
			monto: body.monto,
		}
		return nuevoGasto
	} catch (error) {
		console.log(error)
	}
}

const getId = (urlParse) => {
	const { id } = urlParse.query
	return id
}

const calcular = (gasto, roomMate) => {
	roomMate = roomMate.map((r) => {
		r.debe = 0
		r.recibe = 0
		r.total = 0
		return r
	})
	gasto.forEach((g) => {
		roomMate = roomMate.map((r) => {
			const dividendo = Number((g.monto / roomMate.length).toFixed(2))
			if (g.roommate == r.nombre) {
				r.recibe = r.recibe - dividendo * (roomMate.length - 1)
			} else {
				r.debe = r.debe - dividendo
			}
			r.total = r.recibe - r.debe
			return r
		})
	})
}

const jsonHandler = (jsonFile) => {
	const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
	return json
}

module.exports = { getData, nuevoGasto, getId, calcular, jsonHandler }
