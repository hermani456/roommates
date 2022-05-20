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

const pushData = (obj, array, path, jsonFile, res) => {
	array.push(obj)
	fs.writeFileSync(path, JSON.stringify(jsonFile))
	res.end()
}

const recalculo = () => {
	const roommates = JSON.parse(fs.readFileSync('roommates.json', 'utf8'))
	roommates = roommates.map((r) => {
		r.debe = 0
		r.recibe = 0
		r.total = 0
		return r
	})
	gasto.forEach((g) => {
		roommates = roommates.map((r) => {
			const dividendo = Number((g.monto / roommates.length).toFixed(2))
			if (g.roommate == r.nombre) {
				r.recibe += dividendo * (roommates.length - 1)
			} else {
				r.debe -= dividendo
			}
			r.total = r.recibe - r.debe
			return r
		})
		fs.writeFileSync('roommates.json', JSON.stringify(roommates))
	})
}

module.exports = { getData, nuevoGasto, recalculo }
