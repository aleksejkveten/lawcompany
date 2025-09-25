# Bulk sms
Сообщения SMS


POST
/api/v1/sendBulkSms
Отправка сообщения(-ий) на множество списков, а также персональные сообщения в пакетном режиме

Если вам нужно отправить 1 сообщение на список номеров, тогда используйте параметр 'message_type': 'bulk', как в примере ниже, передавая массив номеров:

'delivery_list': [
    '375297777777',
    '375295555555',
 ]

Если вам требуется отправлять каждое сообщение на отдельный номер телефона, то используйте 'message_type': 'personal', передавая каждый раз текст сообщения и номер телефона:
'delivery_list': [
    {
       'phone': '375299999999',
       'text': 'personal message 1'
    },

Для планирование рассылки вы можете указывать время рассылки через параметр schedule_time, в формате YYYY-MM-DDTHH:mm:ss

Образец api запроса
{
 'token': 'eyJpdiI6IjJzOFlFcXBmOUZEcGJlYzlzeFJValE9PSIsInZhbHV...',
 'callback_url': '',
 'messages': [
    { 
       'alphaname_id': '123',
       'name': 'рассылка 1',
       'message_type': 'personal',
       'schedule_time': '2024-12-31T23:59:59',
       'delivery_list': [
         {
             'phone': '375299999999',
             'text': 'personal message 1'
          },
          { 
            'phone': '375298888888',
            'text': 'personal message 2' 
         } 
      ] 
   }, 
   {
       'alphaname_id': '234',
       'name': 'рассылка 2',
       'message_type': 'bulk',
       'text': 'message text 2',
       'schedule_time': '2024-12-31T23:59:59', 
       'delivery_list': [
         '375297777777', 
         '375295555555', 
       ]
    }
 ]
}
Parameters
Name	Description
token *
string
(query)
Ваш API ключ

token
callback_url *
string
(query)
URL, на который будут приходить ответ по работе метода в асинхронном режиме

callback_url
messages *
array
(query)
Массив сообщения (Образец объекта в описаний запроса)

Responses
Response content type

application/json
Code	Description
200	
Выполнено успешно

Example Value
Model
{
  "uuid": "cc9c8043-8caf-11ef-b035-9e8f47954dec",
  "success": "OK"
}
400	
Некорректный запрос

404	
Страница не найдена

429	
Превышен лимит запросов

500	
Сервер недоступен

# One message


POST
/api/v1/sendQuickSMS
Отправка одиночного сообщения

Parameters
Name	Description
token *
string
(query)
Ваш API ключ

token
message *
string
(query)
Сообщение

message
phone *
string
(query)
Номер телефона

phone
alphaname_id *
string
(query)
alphaname_id
forwarding_message
integer
(formData)
Включить переадресацию (1 - включить, 0 - не включать). Если в течение указанного времени отправленное сообщение не получит статус "Доставлено", оно будет отправлено в Viber

forwarding_message
forwarding_time
integer
(formData)
Через сколько минут произойдёт переадресация, если она включена. По умолчанию 60 минут. Минимум 5 минут. Максимум 60 минут

forwarding_time
vibername_id
integer
(formData)
ID viber-имени, от которого придёт сообщение, если forwarding_message=1 и сообщение на SMS не будет доставлено

vibername_id
Responses
Response content type

application/json
Code	Description
200	
Выполнено успешно

Example Value
Model
{
  "sms_id": 2197871,
  "status": "NEW",
  "parts": 1
}
400	
Некорректный запрос

404	
Страница не найдена

429	
Превышен лимит запросов

500	
Сервер недоступен

# Delivery

GET
/api/v1/getSmsDeliveryList
Получение списка рассылки по идентификатору сообщения

Parameters
Name	Description
token *
string
(query)
Ваш API ключ

token
message_id *
integer
(query)
ID сообщения

message_id
limit_offset
integer
(query)
Смещение выборки

limit_offset
limit_rows
integer
(query)
Ограничение выборки (обязателен, если используется limit_offset)

limit_rows
Responses
Response content type

application/json
Code	Description
200	
Выполнено успешно

Example Value
Model
{
  "result": [
    {
      "phone": 375293332211,
      "status": "delivered",
      "d_sent": "2021-03-22 11:32:32"
    },
    {
      "phone": 375293332212,
      "status": "sent",
      "d_sent": "2021-03-22 11:32:32"
    }
  ]
}
400	
Некорректный запрос

429	
Превышен лимит запросов

500	
Сервер недоступен