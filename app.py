from flask import Flask, render_template, request, redirect, url_for, flash, session
from database import criar_tabela, inserir_usuario, buscar_usuario_por_email
import sqlite3
from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Você precisa fazer login primeiro.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

app = Flask(__name__)
app.secret_key = 'fb_mobintel'

# Cria a tabela ao iniciar o app (só cria se não existir)
criar_tabela()

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        usuario = buscar_usuario_por_email(email)
        
        if usuario:
            if senha == usuario[3]:
                session['user_id'] = usuario[0]  # Salva ID na sessão
                session['user_name'] = usuario[1]
                flash(f"Bem-vindo, {usuario[1]}!", 'success')
                return redirect(url_for('home'))
            else:
                flash("Email ou senha incorretos.", 'error')
                return redirect(url_for('login'))
        else:
            flash("Email ou senha incorretos.", 'error')
            return redirect(url_for('login'))
    
    return render_template('login.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')
        
        sucesso = inserir_usuario(nome, email, senha)
        if sucesso:
            flash("Usuário cadastrado com sucesso!", 'success')
            return redirect(url_for('login'))
        else:
            flash("Erro: Email já cadastrado!", 'error')
            return redirect(url_for('register'))
    
    return render_template("register.html")

@app.route('/home')
@login_required
def home():
    nome = session.get('user_name')
    return render_template('home.html', nome=nome)

@app.route('/logout')
@login_required
def logout():
    session.clear()
    flash('Você saiu da sua conta.', 'info')
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
