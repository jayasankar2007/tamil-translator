import initSqlJs from "sql.js"
import fs from "fs"
import path from "path"

const dbPath = path.join(process.cwd(), "translations.db")

let db: any

export async function initializeDatabase() {
  const SQL = await initSqlJs()

  if (fs.existsSync(dbPath)) {
    const file = fs.readFileSync(dbPath)
    db = new SQL.Database(file)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      english TEXT NOT NULL,
      tamil TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `)

  saveDatabase()
}

function saveDatabase() {
  const data = db.export()
  fs.writeFileSync(dbPath, Buffer.from(data))
}

export function saveTranslation(
  english: string,
  tamil: string
) {
  db.run(
    `INSERT INTO translations
     (english, tamil, created_at)
     VALUES (?, ?, ?)`,
    [english, tamil, new Date().toISOString()]
  )

  saveDatabase()
}

export function getTranslations() {
  const result = db.exec(`
    SELECT id, english, tamil, created_at
    FROM translations
    ORDER BY id DESC
  `)

  if (result.length === 0) {
    return []
  }

  const columns = result[0].columns
  const values = result[0].values

  return values.map((row: any[]) => {
    const item: any = {}

    columns.forEach((column, index) => {
      item[column] = row[index]
    })

    return item
  })
}
export function clearTranslations() {
  db.run(`DELETE FROM translations`)
  saveDatabase()
}