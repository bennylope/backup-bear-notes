#!/usr/bin/env node

const untildify = require(`untildify`)

const BEAR_DB = untildify(
	`~/Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite`
)

const [ ,, outputDirectory ] = process.argv

if (!outputDirectory) {
	throw new Error(`You must provide an output directory`)
}

main(
	untildify(outputDirectory)
).then(writeFileResults => {
	console.log(`Backed up ${ writeFileResults.length } notes.`)
}).catch(err => {
	process.nextTick(() => {
		throw err
	})
})

async function main(outputDirectory) {
	const path = require(`path`)
	const sqlite = require(`sqlite`)
	const makeDir = require(`make-dir`)
	const pify = require(`pify`)
	const fs = pify(require(`fs`))

	await makeDir(outputDirectory)

	const db = await sqlite.open(BEAR_DB)

	const rows = await db.all(`SELECT ZTITLE AS title, ZTEXT AS text FROM ZSFNOTE WHERE ZTRASHED = 0`)

	return Promise.all(
		rows.map(({ title, text }) => {
			const filename = `${ title }.md`

			return fs.writeFile(path.join(outputDirectory, filename), text, { encoding: `utf8` })
		})
	)
}
