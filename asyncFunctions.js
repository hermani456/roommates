const fs = require('fs')

const asyncUnlink = (file) => {
	return new Promise((resolve, reject) => {
		fs.unlink(file, (err) => {
			if (err) reject(err)
			else resolve('File deleted')
		})
	})
}

const asyncReadFile = (file, encoding = 'utf8') => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, encoding, (err, data) => {
			if (err) reject(err)
			else resolve(data)
		})
	})
}

const asyncWriteFile = (file, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, (err) => {
			if (err) reject(err)
			else resolve(data)
		})
	})
}

const asyncRename = (oldPath, newPath) => {
	return new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, (err) => {
			if (err) reject(err)
			else resolve('File renamed')
		})
	})
}

module.exports = { asyncUnlink, asyncReadFile, asyncWriteFile, asyncRename }
