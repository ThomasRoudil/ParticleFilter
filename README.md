# Neural Particle Filter (NFP)

## Stack 
- Backend: python 3.7+
- Db: MongoDB
- Frontend: React.js 16.8

## Local installation

You need to have MongoDB Compass to use the db, and Node to run the front-end (https://nodejs.org/en/download/) :

```bash
$ node -v
v13.10.1
```

Assuming you have node and MongoDB installed, paste these commands in your project folder :

```bash
git clone -b dev https://github.com/EL3PHANT/ParticleFilter.git
cd ParticleFilter
python -m pip install -U --force-reinstall pip
pip install -r api/requirements.txt
cd ui
npm install
```

Then run NPF on a local server:

```bash
python db/init_db.py
```
```bash
python api/app.py
```
```bash
cd ui
npm start
```
