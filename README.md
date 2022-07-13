# Простой TODO проект для портфолио
За основу взят стартер Vitesse, но без файлового роутинга.

Задачи сделать красивый дизайн не стояло. В первую очередь проект показывает базовую работу с REST API, а также создание базовых компонентов "с нуля".

## Как запустить
В настоящий момент в качестве тестового бэкенда используется `json-server`. База данных находится в файле `json-server/db.json`. Логины и пароли находятся в `json-server/users.yaml`

Запускаем json-server:
```bash
npm run json-server
```
После этого уже можно пользоваться самим приложением:
```bash
npm run dev
```
Пользователь по-умолчанию `admin@local`, пароль: `admin`

## Что сделано:
Авторизация и перенаправление для неавторизованных пользователей.

Отображение проекта в виде доски Kanban с перетаскиванием. Настройки отображения автоматически сохраняются в localStorage.

Взаимодействие компонентов с данными происходит по схеме API - Composables - Component. Store используется только для данных об авторизации.

Несколько базовых компонентов:

- VInput: input cо сдвигающимся label (CSS only).
- VCheckbox:  кастомный чекбокс.
- VSelect: кастомный select.
- VSortArray: отображение элементов с возможностью перетаскивать элемент.
- VSortGrid: реализует drag-n-drop для grid-элемента с любым количеством колонок.

Написана система drag-n-drop (в виде composable) для определения пересечений перетаскиваемого элемента с "целью" по полному прямоугольнику, а не только по указателю мыши.

i18n надписей.

## Что не сделано

Работа с firestore. Ничего сложного. В планах.

Многопользовательская работа над проектом.

Тесты. Не то чтобы я их не умею. Просто решил сэкономить время.

Dark mode. Для темизации цветов есть заготовка в виде набора переменных. Надо попробовать.

Базовая обработка ошибок есть, но не все ошибки отображаются пльзователю. Нужно доработать.
