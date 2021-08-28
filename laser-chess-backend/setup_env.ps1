python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
