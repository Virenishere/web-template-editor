
# 🌐 Web Template Editor

The **Web Template Editor** is a modern, full-stack application that allows users to create, edit, preview, and manage website templates in a clean and efficient interface. Built using React, Tailwind CSS, and Express with MongoDB, this editor is perfect for developers, designers, and content creators.

---

## 🖥️ Tech Stack

### Frontend

- React 19
- Tailwind CSS 4
- Vite
- React Router
- Shadcn UI 
- Axios
- dnd-kit/core

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- dotenv for environment management
- CORS enabled for frontend-backend communication

---

## 📂 Project Structure

```

web-template-editor/
│
├── client/                 # React frontend (Vite + Tailwind)
│   └── ...
│
├── server/                 # Express backend with MongoDB
│   └── ...
│
├── README.md               # Project readme
└── LICENSE                 # MIT License

````

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB URI

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Virenishere/web-template-editor.git
cd web-template-editor
````

---

2. **Install dependencies**

**Frontend:**

```bash
cd client
npm install
```

**Backend:**

```bash
cd ../server
npm install
```

---

3. **Setup `.env` file**

In the `server/` directory, create a `.env` file and add:

```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
```

---

4. **Run the app**

**Backend (port 8000):**

```bash
npm run dev
```

**Frontend (port 5173):**

```bash
cd ../client
npm run dev
```

Now open `http://localhost:5173` in your browser.

---

## 📦 Available Scripts

### Frontend (in `client/`)

* `npm run dev` – Start Vite development server
* `npm run build` – Create production build
* `npm run preview` – Preview production build

### Backend (in `server/`)

* `npm run dev` – Start backend with `nodemon`
* `npm start` – Start backend normally

---

## 🧪 Features

* Drag and drop UI components
* Template switching with tabs
* Live preview of templates
* Save and update templates to MongoDB
* Responsive and accessible design
* Modern UX with animations and Radix components

---

## 📃 License

This project is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for more details.

---

## 🤝 Contributing

Pull requests are welcome! If you'd like to improve the project, feel free to fork and submit a PR.

---

## 📬 Contact

Created with ❤️ by **Virender Prasad**
Feel free to connect on [LinkedIn](https://www.linkedin.com/in/virenderprasad) or check out my [GitHub](https://github.com/Virenishere)




