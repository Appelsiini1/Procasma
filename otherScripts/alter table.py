import sqlite3

with sqlite3.connect("database.db") as con:
    c = con.cursor()
    #c.execute("ALTER TABLE assignments ADD COLUMN extra NOT NULL DEFAULT 0")
    #c.execute("SELECT extra FROM assignments WHERE id=?", ("28c80ea72827b8cddf1399af0e7548e43f872095695d58fe74af6dc99b950db5", ))
    #print(c.fetchone())
    con.commit()