# database.py
import sqlite3

def conectar():
    return sqlite3.connect("FluxBus.db")

def criar_tabela():
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def inserir_usuario(nome, email, senha):
    conn = conectar()
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', (nome, email, senha))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # e-mail duplicado
    finally:
        conn.close()

def buscar_usuario_por_email(email):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE email = ?', (email,))
    usuario = cursor.fetchone()
    conn.close()
    return usuario