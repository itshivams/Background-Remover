# Background Remover

A full-stack application for removing image backgrounds.
It provides a **Next.js frontend** for uploading and previewing images and a **FastAPI backend** for processing image background removal.

---

## 📌 Tech Stack

### Frontend

* [Next.js](https://nextjs.org/) (React framework)
* TypeScript
* Tailwind CSS
* Docker support

### Backend

* [FastAPI](https://fastapi.tiangolo.com/) (Python web framework)
* Uvicorn (ASGI server)
* Pillow / Image libraries for processing
* Docker support

---

## 📂 Project Structure

```
Background-Remover-main/
│── frontend/               # Next.js frontend
│   ├── app/                # App router pages & APIs
│   ├── public/             # Static files
│   ├── package.json        # Frontend dependencies
│   └── Dockerfile          # Container setup
│
│── backend/                # FastAPI backend
│   ├── app/main.py         # API entrypoint
│   ├── requirements.txt    # Backend dependencies
│   └── Dockerfile          # Container setup
│
│── docker-compose.yml      # Multi-service orchestration
│── README.md               # Documentation
│── LICENSE
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/itshivams/background-remover.git
cd background-remover
```

---

### 2. Run with Docker (Recommended)

Make sure you have **Docker** and **Docker Compose** installed.
Then run:

```bash
docker-compose up --build
```

* Frontend will be available at: **[http://localhost:3000](http://localhost:3000)**
* Backend will be available at: **[http://localhost:8000](http://localhost:8000)**

---

### 3. Run Manually

#### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

➡ API will run on **[http://localhost:8000](http://localhost:8000)**

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

➡ App will run on **[http://localhost:3000](http://localhost:3000)**

---

## 🛠 Contributing

Contributions are welcome! 🎉

1. Fork the repo
2. Create your feature branch

   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add my feature"
   ```
4. Push to branch

   ```bash
   git push origin feature/my-feature
   ```
5. Open a Pull Request

---


