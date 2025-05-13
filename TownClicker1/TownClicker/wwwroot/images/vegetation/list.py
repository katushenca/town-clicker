import os

# Получаем список файлов в текущей директории
files = [f for f in os.listdir('.') if os.path.isfile(f)]

# Фильтруем только .png файлы (если нужно именно их)
png_files = [f for f in files if f.lower().endswith('.png')]

# Форматируем вывод
formatted_files = ', '.join([f'"{f}"' for f in png_files])

print(formatted_files)