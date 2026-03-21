import cv2
import numpy as np
import task
import matplotlib.pyplot as plt


# SERVER IMPORTS
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import json
import time
import os
import uuid
from datetime import datetime
import mimetypes
from pathlib import Path
# /SERVER IMPORTS


def get_pic2(path_img, accuracy):
    """
    Обработка снимка с целью обнаружения границ шва
    """
    with open(path_img, 'rb') as f:  # ← Относительный путь!
        img_bytes = f.read()
    
    print(f"Bytes read: {len(img_bytes)}")
    
    if len(img_bytes) == 0:
        return "Файл пустой"
    
    # Декодирование из байтов
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    base_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    height, width, _ = img.shape

    # Увеличение контраста и яркости
    img = cv2.convertScaleAbs(img, alpha=1.5, beta=0) 
    img = cv2.add(img, 150)  
 
    # Самое главное - brightness_matrix, с ней мы дальше работаем
    brightness_matrix = task.get_brightness_matrix(img)

    # Подсчет среднего значения фона
    sum_bright = 0
    for i in range(height):
        for j in brightness_matrix[i]:
            sum_bright += float(j)
    # Среднее значение
    middle = sum_bright / (width * height)

    # Транспонирование матрицы снимка
    trans_brightness_matrix = [[0 for _ in range(height)] for _ in range(width)]
    for i in range(height):
        for j in range(width):
            trans_brightness_matrix[j][i] = brightness_matrix[i][j]

    trans_width = height
    trans_height = width

    # Поиск максимального дельта-освещения в каждом ряду
    dt_id_array_top = []
    for i in trans_brightness_matrix:
        max_delta_id, max_delta = 0, 0
        for j in range(trans_width):
            delta_value = abs(middle-float(i[j])) 
            if delta_value > max_delta:
                max_delta = delta_value
                max_delta_id = j
        dt_id_array_top.append(max_delta_id)

    # Исключение выбросов
    dt_id_array_top = task.simple_clean_outliers(dt_id_array_top, accuracy)

    # Поиск максимального дельта-освещения снизу-вверх
    dt_id_array_bottom = []
    for i in trans_brightness_matrix:
        max_delta_id, max_delta = 0, 0
        for j in range(trans_width, 0, -1):
            delta_value = abs(middle-float(i[j-1]))
            if delta_value > max_delta:
                max_delta = delta_value
                max_delta_id = j
        dt_id_array_bottom.append(max_delta_id)

    # Исключение выбросов
    dt_id_array_bottom = task.simple_clean_outliers(dt_id_array_bottom, accuracy)

    # Расчет точек для центра
    middle_line_array = []
    sum_bort = 0 # bort - ширина шва / 2
    for i in range(width):
        bort = (dt_id_array_bottom[i] - dt_id_array_top[i]) / 2
        coord = int(dt_id_array_top[i] + bort)
        sum_bort += bort
        middle_line_array.append(coord)

    # Среднее расстояние от середины до края шва
    bort = sum_bort / width

    # Исключение выбросов
    middle_line_array = task.simple_clean_outliers(middle_line_array, accuracy * 2)

    # Расчет k и b
    arr_x = [0] * width
    counter = 0
    for i in range(width):
        arr_x[i] += counter
        counter+= 1
    x = np.array(arr_x)
    y = np.array([p for p in middle_line_array])
    k, b = np.polyfit(x, y, 1)

    # Отрисовка центра
    y1_middle = int(k + b)
    y2_middle = int(k*width + b)
    cv2.line(base_img, (0, y1_middle), (width, y2_middle), (120, 0, 0), 2)

    # Отрисовка верхней границы
    y1_top = int(y1_middle - bort)
    y2_top = int(y2_middle - bort)
    cv2.line(base_img, (0, y1_top), (width, y2_top), (0, 0, 120), 2)

    # Отрисовка нижней границы
    y1_bottom = int(y1_middle + bort)
    y2_bottom = int(y2_middle + bort)
    cv2.line(base_img, (0, y1_bottom), (width, y2_bottom), (0, 0, 120), 2)

    return [y1_middle, y2_middle, y1_top, y2_top, y1_bottom, y2_bottom, width, height]

#  SERVER --->

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Парсинг URL
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Определение базовой директории для файлов
        base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
        
        # Обработка корневого пути
        if path == '/':
            filepath = os.path.join(base_dir, 'index.html')
            self.serve_file(filepath, 'text/html')
        
        # Остальные файлы
        else:
            # Удаление начального слэша и добавление к базовой директории
            filepath = os.path.join(base_dir, path.lstrip('/'))
            
            # Проверка существования файла
            if os.path.exists(filepath) and os.path.isfile(filepath):
                # Определение MIME-типа
                mime_type, _ = mimetypes.guess_type(filepath)
                if mime_type is None:
                    mime_type = 'application/octet-stream'
                
                self.serve_file(filepath, mime_type)
            else:
                self.send_error(404, "Not Found")
    
    def do_POST(self):
        # Парсинг URL
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/find_shov':
            # Обработка загрузки изображения для поиска шва
            self.handle_image_upload()
        else:
            self.send_error(404, "Not Found")
    
    def handle_image_upload(self):
        """Обработка загрузки изображения для поиска шва"""
        try:
            # Заголовок Content-Type
            content_type = self.headers.get('Content-Type', '')
            
            # Проверка, что это multipart/form-data
            if 'multipart/form-data' not in content_type:
                self.send_error(400, "Bad Request: Expected multipart/form-data")
                return
            
            # Получение границы из Content-Type
            boundary = None
            for part in content_type.split(';'):
                part = part.strip()
                if part.startswith('boundary='):
                    boundary = '--' + part[9:]
                    break
            
            if not boundary:
                self.send_error(400, "Bad Request: No boundary found")
                return
            
            # Чтение всего тела запроса
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # multipart данные
            parts = post_data.split(boundary.encode())
            
            for part in parts:
                if b'Content-Disposition: form-data;' in part:
                    # Поиск имени файла
                    if b'filename="' in part:
                        # Разделение заголовков и данных
                        headers_end = part.find(b'\r\n\r\n')
                        if headers_end == -1:
                            continue
                        
                        headers = part[:headers_end].decode('utf-8', errors='ignore')
                        file_data = part[headers_end + 4:]  # +4 для \r\n\r\n
                        
                        # Исключение завершающих \r\n в конце данных
                        if file_data.endswith(b'\r\n'):
                            file_data = file_data[:-2]
                        
                        # Генерация имени файла
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        unique_id = str(uuid.uuid4())[:8]
                        filename = "shov.png"
                        # filename = f"shov_image_{timestamp}_{unique_id}.png"
                        
                        # Путь к директории py (где находится этот скрипт)
                        py_dir = os.path.dirname(os.path.abspath(__file__))
                        filepath = os.path.join(py_dir, filename)
                        
                        # Сохранение файла
                        with open(filepath, 'wb') as f:
                            f.write(file_data)
                        
                        print(f"Изображение сохранено: {filepath}")
                        
                        # Успешный ответ
                        self.send_response(200)
                        self.send_header('Content-Type', 'application/json')
                        self.send_header('Access-Control-Allow-Origin', '*')  # Для CORS
                        self.end_headers()


                        coords = get_pic2(str(filepath), 1)
                        
                        response = {
                            'status': 'success',
                            'message': 'Изображение успешно сохранено',
                            'filename': filename,
                            'path': filepath,
                            'coordinates': coords,
                        }
                        self.wfile.write(json.dumps(response).encode('utf-8'))
                        return
            
            # Если не найден файл в запросе
            self.send_error(400, "Bad Request: No image file found")
            
        except Exception as e:
            print(f"Ошибка при обработке загрузки: {e}")
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def serve_file(self, filepath, content_type):
        """Универсальный метод для отправки файлов"""
        try:
            # Существование файла
            if not os.path.exists(filepath):
                self.send_error(404, f"File not found: {filepath}")
                return
            # Чтение файла
            with open(filepath, 'rb') as f:
                content = f.read()
            # Отправка ответа
            self.send_response(200)
            # Для текстовых файлов добавляется кодировку
            if content_type.startswith('text/'):
                self.send_header('Content-Type', content_type + '; charset=utf-8')
            else:
                self.send_header('Content-Type', content_type)
                
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')  # Для CORS
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    # Переопределение метода log_message, чтобы не выводить логи в консоль (опционально)
    def log_message(self, format, *args):
        print(f"{self.address_string()} - {format % args}")

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHandler)
    print(f'Server running on http://localhost:{port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server(8000)  