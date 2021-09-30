## How to run:
### Prepare environment
#### Docker
Simply run
```bash
docker-compose up -d
```
#### Windows
##### Prepare python environment
```powershell
./setup_env.ps1
```

##### Populate app/.env file
For example:
```shell
SQLALCHEMY_DATABASE_URL="postgresql://postgres:password@localhost:5432/laserchess"
```

### Run
```bash
uvicorn main:app --reload
```

or

```bash
python -m app.main
```
