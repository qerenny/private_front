#!/bin/bash

OUTPUT="../../all_code.txt"
TARGET="../microservices"

> "$OUTPUT"

# Получить размер файла (кроссплатформенно)
get_size() {
    if stat --version >/dev/null 2>&1; then
        # GNU stat (Linux)
        stat -c%s "$1"
    else
        # BSD stat (macOS)
        stat -f%z "$1"
    fi
}

# Получить количество строк
get_lines() {
    wc -l < "$1" | tr -d ' '
}

# Проверка: является ли файл бинарным
is_binary() {
    file "$1" | grep -qi "binary"
}

# Какие расширения считаем кодом
EXTENSIONS="py ts js tsx jsx go java kt rs cpp hpp c cs php rb swift sql json yaml yml toml md sh env cfg ini dockerfile"

is_code_file() {
    local file="$1"
    local ext="${file##*.}"
    ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    for e in $EXTENSIONS; do
        if [ "$ext" = "$e" ]; then
            return 0
        fi
    done

    # Специальные файлы без расширения
    case "$(basename "$file" | tr '[:upper:]' '[:lower:]')" in
        dockerfile|makefile|readme|readme.md)
            return 0
            ;;
    esac

    return 1
}

find "$TARGET" -type f | while IFS= read -r f; do

    # Пропускаем файл результата
    if [[ "$f" == *"$OUTPUT"* ]]; then
        continue
    fi

    # Пропускаем бинарные файлы
    if is_binary "$f"; then
        continue
    fi

    SIZE=$(get_size "$f")
    if [ -z "$SIZE" ]; then
        continue
    fi

    # Пропускаем большие файлы > 1 MB
    if [ "$SIZE" -gt 1000000 ]; then
        continue
    fi

    # Пропускаем не-код
    if ! is_code_file "$f"; then
        continue
    fi

    LINES=$(get_lines "$f")

    echo "===== $f ($(basename "$f") — $LINES lines, $SIZE bytes) =====" >> "$OUTPUT"
    cat "$f" >> "$OUTPUT"
    echo -e "\n" >> "$OUTPUT"

done

echo "Готово! Код собран в $OUTPUT"

