# ivi-clone-dev

0. В каждой директории создаём папку dist вручную ЛИБО Запускаем npm start:dev для каждого микросервиса. 
1. В каждой директории создаём контейнер с сервисом, команды:  "docker build -t ivi-auth-user-service:0.1 ."   и     "docker build -t ivi-profile-service:0.1 ."   соответственно
2. В общей директории запускаем "docker-compose up"
3. Надеямся, что всё завелось.
4. Проверка: для auth-user-service запросом с доменом http://localhost:7001, для profile-service с доменом http://localhost:7000  (пинг запрос остался)
5. Добавить роли:
  curl --location 'http://localhost:7001/roles' \
--header 'Content-Type: application/json' \
--data '{
    "value": "USER",
    "description": "юзер"
}'

curl --location 'http://localhost:7001/roles' \
--header 'Content-Type: application/json' \
--data '{
    "value": "ADMIN",
    "description": "админ"
}'
