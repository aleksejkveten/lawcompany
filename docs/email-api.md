Email


POST
/api/v2/sendEmail
Отправка письма на указанный адрес

Parameters
Name	Description
token *
string
(formData)
Ваш API ключ

token
sender_email *
string
(formData)
Email-адрес отправителя, от которого будет отправлено письмо

sender_email
sender_name
string
(formData)
Имя отправителя

sender_name
subject *
string
(formData)
Заголовок письма

subject
message *
string
(formData)
Содержимое письма

message
attachment
file
(formData)
Прикреплённый файл

Файл не выбран
email *
string
(formData)
Email-адрес получателя

email
d_schedule
string
(formData)
Если вы хотите отложить отправку письма, укажите здесь дату отправки в формате 'ГГГГ-ММ-ДД ЧЧ:ММ'

d_schedule
track_open
number
(formData)
0: не отслеживать открытие письма, 1: отслеживать. Если не задано, установится в 1

track_open
track_click
number
(formData)
0: не отслеживать переход по ссылкам из письма, 1: отслеживать. Если не задано, установится в 1

track_click
Responses
Response content type

application/json
Code	Description
200	
Выполнено успешно

Example Value
Model
{
  "status": "OK",
  "result": {
    "email_id": 1234567
  }
}