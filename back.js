const express = require('express');
const fs = require('fs');

const app = express();
const port = 7000;
const dataFilePath = 'data.json';

app.use(express.json());

// Проверка наличия файла перед загрузкой данных
if (!fs.existsSync(dataFilePath)) {
    // Если файла нет, создаем пустой массив данных
    fs.writeFileSync(dataFilePath, '[]', 'utf-8');
}

// Загрузка данных из файла при старте сервера
let data = loadFile();

// Обработка запроса на сохранение данных
app.post('/save', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email || !validateEmail(email)) {
        return res.status(400).send('Invalid data');
    }

    const record = {
        name,
        email,
        createdAt: new Date(),
        updatedAt: null,
    };

    data.push(record);
    saveFile(data);

    res.json(data);
});

// Обработка запроса на изменение почты
app.put('/update/:name', (req, res) => {
    const { name } = req.params;
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).send('Invalid data');
    }

    const recordIndex = data.findIndex(record => record.name === name);

    if (recordIndex === -1) {
        return res.status(404).send('Record not found');
    }

    data[recordIndex].email = email;
    data[recordIndex].updatedAt = new Date();
    saveFile(data);

    res.json(data);
});

// Обработка запроса на получение списка записей
app.get('/records', (req, res) => {
    res.json(data);
});

// Старт сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Функция загрузки данных из файла
function loadFile() {
    try {
        const content = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        return [];
    }
}

// Функция сохранения данных в файл
function saveFile(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Функция валидации email
function validateEmail(email) {
    // Регулярное выражение для валидации email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Простая проверка формата email
    if (!emailRegex.test(email)) {
        return false;
    }

    // Дополнительные проверки
    const [user, domain] = email.split('@');

    // Проверка длины локальной части (не более 64 символов)
    if (user.length > 64) {
        return false;
    }

    // Проверка длины доменной части (не более 255 символов)
    if (domain.length > 255) {
        return false;
    }

    // Проверка наличия хотя бы одной точки в доменной части
    if (!domain.includes('.')) {
        return false;
    }

    // Проверка отсутствия двух точек подряд в локальной или доменной части
    if (user.includes('..') || domain.includes('..')) {
        return false;
    }

    return true;
}

